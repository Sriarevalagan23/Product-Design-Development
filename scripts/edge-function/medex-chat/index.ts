import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY =
    Deno.env.get("GEMINI_API_KEY");

const GEMINI_MODEL =
    "gemini-2.0-flash";

const GEMINI_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const corsHeaders = {
    "Access-Control-Allow-Origin":
        "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
    message: string;
    session_id: string;
    document_id?: string;
}

type Intent =
    | "health_knowledge"
    | "document_query"
    | "report_analysis";

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

/**
 * INTENT DETECTION
 */
function detectIntent(
    message: string
): Intent {
    const lower =
        message.toLowerCase();

    // DOCUMENT QUERY
    if (
        lower.includes(
            "my reports"
        ) ||
        lower.includes(
            "what reports"
        ) ||
        lower.includes(
            "uploaded"
        ) ||
        lower.includes(
            "show reports"
        ) ||
        lower.includes(
            "list reports"
        ) ||
        lower.includes(
            "available reports"
        ) ||
        lower.includes(
            "which reports"
        )
    ) {
        return "document_query";
    }

    // REPORT ANALYSIS
    if (
        lower.includes("report") ||
        lower.includes("scan") ||
        lower.includes(
            "blood report"
        ) ||
        lower.includes(
            "blood test"
        ) ||
        lower.includes(
            "ecg"
        ) ||
        lower.includes(
            "xray"
        ) ||
        lower.includes(
            "x-ray"
        ) ||
        lower.includes(
            "mri"
        ) ||
        lower.includes(
            "ct scan"
        ) ||
        lower.includes(
            "infer"
        ) ||
        lower.includes(
            "explain my"
        ) ||
        lower.includes(
            "apollo"
        ) ||
        lower.includes(
            "latest report"
        ) ||
        lower.includes(
            "my blood"
        ) ||
        lower.includes(
            "my scan"
        )
    ) {
        return "report_analysis";
    }

    return "health_knowledge";
}

/**
 * FIND RELEVANT REPORT
 */
async function findRelevantReport(
    supabase: any,
    userId: string,
    message: string
) {
    const lower =
        message.toLowerCase();

    const { data: docs } =
        await supabase
            .from(
                "user_documents"
            )
            .select("*")
            .eq(
                "user_id",
                userId
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            );

    if (!docs?.length)
        return null;

    // APOLLO
    if (
        lower.includes(
            "apollo"
        )
    ) {
        const report =
            docs.find(
                (d: any) =>
                    d.hospital_name
                        ?.toLowerCase()
                        .includes(
                            "apollo"
                        )
            );

        if (report)
            return report;
    }

    // BLOOD
    if (
        lower.includes(
            "blood"
        )
    ) {
        const report =
            docs.find(
                (d: any) =>
                    d.report_category
                        ?.toLowerCase()
                        .includes(
                            "blood"
                        )
            );

        if (report)
            return report;
    }

    // ECG
    if (
        lower.includes(
            "ecg"
        )
    ) {
        const report =
            docs.find(
                (d: any) =>
                    d.report_category
                        ?.toLowerCase()
                        .includes(
                            "ecg"
                        )
            );

        if (report)
            return report;
    }

    // LATEST OR DEFAULT
    if (
        lower.includes("latest") ||
        lower.includes("recent") ||
        lower.includes("last")
    ) {
        return docs[0];
    }

    return null;
}

function arrayBufferToBase64(
    buffer: ArrayBuffer
) {
    const bytes =
        new Uint8Array(
            buffer
        );

    let binary = "";

    for (
        let i = 0;
        i < bytes.length;
        i++
    ) {
        binary +=
            String.fromCharCode(
                bytes[i]
            );
    }

    return btoa(binary);
}

serve(async (req) => {
    try {
        if (
            req.method ===
            "OPTIONS"
        ) {
            return new Response(
                "ok",
                {
                    headers:
                        corsHeaders,
                }
            );
        }

        /**
         * SUPABASE CLIENT
         */
        const supabase =
            createClient(
                Deno.env.get(
                    "SUPABASE_URL"
                ) ?? "",
                Deno.env.get(
                    "SUPABASE_SERVICE_ROLE_KEY"
                ) ?? ""
            );

        /**
         * AUTH
         */
        const authHeader =
            req.headers.get(
                "Authorization"
            ) ?? "";

        const token =
            authHeader.replace(
                "Bearer ",
                ""
            );

        const {
            data: { user },
            error:
            authError,
        } =
            await supabase.auth.getUser(
                token
            );

        if (
            authError ||
            !user
        ) {
            return response(
                {
                    error:
                        "Unauthorized",
                },
                401
            );
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        let ageStr = "Unknown";
        if (profile?.dob) {
            const birthDate = new Date(profile.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            ageStr = `${age} years old`;
        }

        const profileContext = `
USER PROFILE:
- Name: ${profile?.full_name || "Unknown"}
- Age: ${ageStr} (DOB: ${profile?.dob || "Unknown"})
- Blood Group: ${profile?.blood_group || "Unknown"}
- Height: ${profile?.height ? profile.height + " cm" : "Unknown"}
- Weight: ${profile?.weight ? profile.weight + " kg" : "Unknown"}
- Allergies: ${profile?.allergies || "None"}
`;

        const body: RequestBody =
            await req.json();

        const {
            message,
            session_id,
            document_id,
        } = body;

        if (
            !message ||
            !session_id
        ) {
            return response(
                {
                    error:
                        "message and session_id required",
                },
                400
            );
        }

        let intent =
            detectIntent(
                message
            );

        if (document_id) {
            intent = "report_analysis";
        }

        /**
     * BLOCK NON-HEALTH TOPICS
     */
        const nonHealthKeywords =
            [
                "supernova",
                "space",
                "galaxy",
                "planet",
                "movie",
                "actor",
                "celebrity",
                "politics",
                "president",
                "election",
                "programming",
                "coding",
                "javascript",
                "react",
                "love",
                "relationship",
                "boyfriend",
                "girlfriend",
                "god",
                "religion",
            ];

        const isNonHealth =
            nonHealthKeywords.some(
                (word) =>
                    message
                        .toLowerCase()
                        .includes(word)
            );

        if (isNonHealth) {
            return response({
                success: true,
                message:
                    "I’m a health assistant, so I can only help with health and medical topics. You can ask me about symptoms, medical reports, body systems, blood tests, or wellness.",
            });
        }

        /**
         * FETCH MEMORY
         */
        const {
            data: memory,
        } = await supabase
            .from(
                "chat_history"
            )
            .select(
                "role,message"
            )
            .eq(
                "user_id",
                user.id
            )
            .eq(
                "session_id",
                session_id
            )
            .order(
                "created_at",
                {
                    ascending:
                        true,
                }
            )
            .limit(8);

        const contents: any[] =
            [];

        memory?.forEach(
            (chat: any) => {
                contents.push({
                    role:
                        chat.role ===
                            "assistant"
                            ? "model"
                            : "user",
                    parts: [
                        {
                            text:
                                chat.message,
                        },
                    ],
                });
            }
        );

        contents.push({
            role: "user",
            parts: [
                {
                    text: message,
                },
            ],
        });

        let systemPrompt =
            "";

        let report =
            null;

        /**
         * HEALTH MODE
         */
        if (
            intent ===
            "health_knowledge"
        ) {
            systemPrompt = systemPrompt = `
You are Medex AI.

You are a STRICT healthcare assistant.

You ONLY answer questions related to:

- Human anatomy
- Human body systems
- Diseases
- Symptoms
- Medical terminology
- Blood tests
- Vital signs
- Nutrition
- Exercise
- Mental wellness
- Medicines (educational only)
- Preventive healthcare
- Medical reports
- Healthcare guidance

CRITICAL RULES:

1. ONLY answer health or medical questions.

2. If the question is unrelated to health, politely refuse and redirect to health topics.

3. Never answer:
- astronomy
- physics
- coding
- celebrities
- movies
- relationships
- philosophy
- politics
- religion
- random facts
- general knowledge

4. Keep answers concise:
Maximum 2–4 short sentences.

5. Sound conversational and friendly.

6. Never diagnose disease.

7. Never prescribe medicine.

8. Never create fear.

EXAMPLES:

User:
"What is supernova?"

Answer:
"I’m a health assistant, so I can only help with medical and health-related topics. Feel free to ask about the human body, symptoms, blood tests, or wellness."

User:
"What is love?"

Answer:
"I’m focused on health and medical topics. I can help explain mental wellness, emotions, stress, or related health topics."

User:
"What is heart rate?"

Answer:
"Heart rate is the number of times your heart beats per minute. A normal resting heart rate for adults is usually between 60–100 beats per minute."

User:
"What is cholesterol?"

Answer:
"Cholesterol is a fat-like substance in the blood. Your body needs it, but high LDL (‘bad cholesterol’) may increase heart-related risks."
`;
        }

        /**
         * DOCUMENT QUERY MODE
         */
        if (
            intent ===
            "document_query"
        ) {
            const {
                data: docs,
            } =
                await supabase
                    .from(
                        "user_documents"
                    )
                    .select(`
          report_name,
          report_category,
          hospital_name,
          report_date
        `)
                    .eq(
                        "user_id",
                        user.id
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                false,
                        }
                    );

            const reportText =
                docs?.length
                    ? docs
                        .map(
                            (
                                d: any
                            ) =>
                                `- ${d.report_name} (${d.report_category}) from ${d.hospital_name || "Unknown"} on ${d.report_date || "Unknown date"}`
                        )
                        .join(
                            "\n"
                        )
                    : "No reports uploaded.";

            systemPrompt = `
You are Medex AI.

Answer ONLY using uploaded report metadata.

Keep responses concise.

User uploaded reports:
${reportText}
`;
        }

        /**
         * REPORT MODE
         */
        if (
            intent ===
            "report_analysis"
        ) {
            if (
                document_id
            ) {
                const {
                    data,
                } =
                    await supabase
                        .from(
                            "user_documents"
                        )
                        .select("*")
                        .eq(
                            "id",
                            document_id
                        )
                        .eq(
                            "user_id",
                            user.id
                        )
                        .single();

                report =
                    data;
            } else {
                report =
                    await findRelevantReport(
                        supabase,
                        user.id,
                        message
                    );
            }

            if (
                !report
            ) {
                const {
                    data: docs,
                } = await supabase
                    .from("user_documents")
                    .select("report_name, report_category, hospital_name, report_date")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });

                const reportText = docs?.length
                    ? docs.map((d: any) => `- ${d.report_name} (${d.report_category}) from ${d.hospital_name || "Unknown"} on ${d.report_date || "Unknown date"}`).join("\n")
                    : "No reports uploaded.";

                systemPrompt = `
You are Medex AI.
The user asked about a report but didn't specify which one.
List the following available reports and ask them to clarify which one they mean:

${reportText}
`;
                intent = "document_query";
            } else {
                systemPrompt = `
You are Medex AI.

You have access to the user's medical report.
Answer the user's question directly.
If the question is about the report, use the report details to answer.
If the question is a general health question, answer it normally, using the report for context only if relevant.
Do NOT just re-explain the whole report unless the user specifically asks you to explain it.

Rules:
- Keep concise
- Max 5 short sentences
- Never diagnose
- Never prescribe medicine
- Be calm and helpful
`;
            }
        }

        /**
        * GEMINI REQUEST BODY
        */
        const requestBody: any = {
            systemInstruction: {
                parts: [
                    {
                        text: `${profileContext}\n${systemPrompt}`,
                    },
                ],
            },

            generationConfig: {
                temperature: 0.4,
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 250,
            },

            contents,
        };

        /**
         * REPORT MULTIMODAL READING
         */
        if (
            intent ===
            "report_analysis" &&
            report
        ) {
            const {
                data:
                signedUrlData,
                error:
                signedUrlError,
            } =
                await supabase.storage
                    .from(
                        "user_docs"
                    )
                    .createSignedUrl(
                        report.file_url,
                        60
                    );

            if (
                signedUrlError ||
                !signedUrlData
            ) {
                return response(
                    {
                        error:
                            "Unable to access report file",
                    },
                    500
                );
            }

            /**
             * DOWNLOAD FILE
             */
            const fileResponse =
                await fetch(
                    signedUrlData.signedUrl
                );

            if (
                !fileResponse.ok
            ) {
                return response(
                    {
                        error:
                            "Failed to download report file",
                    },
                    500
                );
            }

            const arrayBuffer =
                await fileResponse.arrayBuffer();

            const base64File =
                arrayBufferToBase64(
                    arrayBuffer
                );

            /**
             * OVERRIDE CONTENTS
             * FOR MULTIMODAL
             */
            requestBody.contents =
                [
                    {
                        role:
                            "user",

                        parts:
                            [
                                {
                                    inlineData:
                                    {
                                        mimeType:
                                            report.file_type ||
                                            "application/pdf",

                                        data:
                                            base64File,
                                    },
                                },

                                {
                                    text: `
User Question:
${message}

Report Name:
${report.report_name}

Hospital:
${report.hospital_name || "Unknown"}

Category:
${report.report_category}
`,
                                },
                            ],
                    },
                ];
        }

        /**
         * GEMINI API CALL
         */
        const geminiResponse =
            await fetch(
                `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
                {
                    method:
                        "POST",

                    headers:
                    {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        ),
                }
            );

        if (
            !geminiResponse.ok
        ) {
            const errorText =
                await geminiResponse.text();

            console.error(
                "Gemini Error:",
                errorText
            );

            return response(
                {
                    error:
                        "Gemini request failed",
                },
                500
            );
        }

        const geminiData =
            await geminiResponse.json();

        console.log(
            "Gemini Response:",
            JSON.stringify(
                geminiData,
                null,
                2
            )
        );

        const assistantReply =
            geminiData
                ?.candidates?.[0]
                ?.content
                ?.parts?.[0]
                ?.text
                ?.trim() ||
            "Sorry, I couldn't understand that right now.";

        /**
         * SAVE CHAT HISTORY
         */
        await supabase
            .from(
                "chat_history"
            )
            .insert([
                {
                    user_id:
                        user.id,

                    session_id,

                    role:
                        "user",

                    message,
                },

                {
                    user_id:
                        user.id,

                    session_id,

                    role:
                        "assistant",

                    message:
                        assistantReply,
                },
            ]);

        /**
         * FINAL RESPONSE
         */
        return response({
            success:
                true,

            message:
                assistantReply,

            intent,
        });
    } catch (
    error
    ) {
        console.error(
            "Medex Chat Error:",
            error
        );

        return response(
            {
                success:
                    false,

                error:
                    error instanceof
                        Error
                        ? error.message
                        : "Unexpected error occurred",
            },
            500
        );
    }
});