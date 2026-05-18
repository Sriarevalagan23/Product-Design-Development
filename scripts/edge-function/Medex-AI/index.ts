import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_MODEL =
    Deno.env.get("GEMINI_MODEL") || "gemini-2.0-flash";

const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
    document_id: string;
}

serve(async (req) => {
    try {
        if (req.method === "OPTIONS") {
            return new Response("ok", {
                headers: corsHeaders,
            });
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
            {
                global: {
                    headers: {
                        Authorization:
                            req.headers.get("Authorization") ?? "",
                    },
                },
            }
        );

        // AUTH USER
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return response(
                { error: "Unauthorized" },
                401
            );
        }

        const body: RequestBody = await req.json();

        if (!body.document_id) {
            return response(
                { error: "document_id is required" },
                400
            );
        }

        // CHECK CACHE
        const { data: cached } = await supabase
            .from("ai_document_explanations")
            .select("explanation")
            .eq("document_id", body.document_id)
            .single();

        if (cached?.explanation) {
            return response({
                success: true,
                explanation: cached.explanation,
                cached: true,
            });
        }

        // FETCH DOCUMENT
        const { data: document, error: docError } =
            await supabase
                .from("user_documents")
                .select("*")
                .eq("id", body.document_id)
                .eq("user_id", user.id)
                .single();

        if (docError || !document) {
            return response(
                {
                    error:
                        "Document not found or access denied",
                },
                404
            );
        }

        // CREATE SIGNED URL
        const { data: signedUrlData, error: urlError } =
            await supabase.storage
                .from("user_docs")
                .createSignedUrl(
                    document.file_url,
                    60
                );

        if (urlError || !signedUrlData?.signedUrl) {
            return response(
                {
                    error:
                        "Failed to access document",
                },
                500
            );
        }

        // DOWNLOAD FILE
        const fileResponse = await fetch(
            signedUrlData.signedUrl
        );

        if (!fileResponse.ok) {
            return response(
                {
                    error:
                        "Failed to download file",
                },
                500
            );
        }

        const arrayBuffer =
            await fileResponse.arrayBuffer();

        // CONVERT TO BASE64 (SAFE VERSION)
        function arrayBufferToBase64(
            buffer: ArrayBuffer
        ) {
            const bytes = new Uint8Array(buffer);

            let binary = "";

            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(
                    bytes[i]
                );
            }

            return btoa(binary);
        }

        const base64File =
            arrayBufferToBase64(arrayBuffer);

        const mimeType =
            document.file_type ||
            "application/pdf";

        // SYSTEM PROMPT
        const systemPrompt = `
You are Medex AI.

You are an intelligent healthcare assistant inside the Medex Personal Health Record app.

Your task is to explain uploaded medical reports in a safe, easy-to-understand, hybrid conversational format.

STYLE:
- Friendly
- Professional
- Calm
- Educational
- Simple language

IMPORTANT RULES:
- Never diagnose disease.
- Never prescribe medication.
- Never claim certainty.
- Never replace doctors.
- Avoid fear-based language.
- If findings seem important, recommend medical consultation.

RESPONSE FORMAT:

Start conversationally.

Then include:

1. What this report appears to be
2. Main things measured or discussed
3. Key observations (if visible)
4. What this usually means
5. Encourage professional consultation

Keep response readable and concise.

Document metadata:
- Category: ${document.report_category}
- Name: ${document.report_name}
- Hospital: ${document.hospital_name || "Unknown"}
- Date: ${document.report_date || "Unknown"}
- Notes: ${document.additional_notes || "None"}
`;

        // GEMINI REQUEST
        const geminiBody = {
            systemInstruction: {
                parts: [
                    {
                        text: systemPrompt,
                    },
                ],
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text:
                                "Please explain this medical report in a hybrid conversational style.",
                        },
                        {
                            inlineData: {
                                mimeType,
                                data: base64File,
                            },
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.3,
                topP: 0.9,
                maxOutputTokens: 1000,
            },
        };

        // CALL GEMINI
        const geminiResponse =
            await fetch(GEMINI_URL, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    geminiBody
                ),
            });

        const geminiData =
            await geminiResponse.json();

        const explanation =
            geminiData?.candidates?.[0]
                ?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't explain this report.";

        // SAVE CACHE
        await supabase
            .from("ai_document_explanations")
            .insert({
                document_id:
                    body.document_id,
                user_id: user.id,
                explanation,
            });

        return response({
            success: true,
            explanation,
            cached: false,
        });
    } catch (error) {
        console.error(error);

        return response(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            500
        );
    }
});

function response(
    body: unknown,
    status = 200
) {
    return new Response(
        JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type":
                    "application/json",
            },
        }
    );
}