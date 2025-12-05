const OpenAI = require('openai');

class AIService {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        // Check if key is obviously invalid
        this.isMock = !apiKey;

        if (!this.isMock) {
            this.openai = new OpenAI({
                apiKey,
                baseURL: 'https://api.groq.com/openai/v1'
            });
            console.log("✅ Groq API Key found. Using Groq AI Service.");
        } else {
            console.log("⚠️  API Key missing or invalid. Using MOCK AI Service.");
        }
    }

    // --- Mock Data Helpers ---

    _getMockRFP(text) {
        console.log("Returning Mock RFP Structure...");
        return {
            title: "Mock RFP: " + text.substring(0, Math.min(text.length, 20)) + (text.length > 20 ? "..." : ""),
            items: [
                { name: "High-performance Laptop", quantity: 50, specs: "i7, 32GB RAM, 1TB SSD" },
                { name: "Docking Station", quantity: 50, specs: "USB-C, Dual HDMI" }
            ],
            budget: "$100,000",
            timeline: "4 weeks",
            warranty: "3 years onsite",
            terms: "Net 30"
        };
    }

    _getMockEmailParse() {
        console.log("Returning Mock Email Parse...");
        return {
            vendor_name: "Mock Vendor Inc",
            total_price: 95000,
            currency: "USD",
            line_items: [
                { name: "Laptop", price: 1800, quantity: 50 },
                { name: "Dock", price: 100, quantity: 50 }
            ],
            delivery_timeline: "3 weeks",
            warranty_offered: "3 years",
            payment_terms: "Net 45"
        };
    }

    _getMockComparison(proposals) {
        console.log("Returning Mock Comparison...");
        const matrix = proposals.map((p, index) => ({
            vendor_id: p.vendor,
            score: index === 0 ? 95 : 70 + Math.floor(Math.random() * 15), // First one is winner
            analysis: index === 0
                ? "Excellent match for requirements with competitive pricing."
                : "Good proposal but lacks specific product details or higher price.",
            pros: ["Good price", "Fast delivery"],
            cons: ["Shorter warranty"]
        }));

        return {
            comparison_matrix: matrix,
            recommendation: proposals[0]?.vendor || "Vendor A",
            justification: "This vendor offers the best balance of price and performance based on the mock analysis."
        };
    }

    // --- Main Methods ---

    async generateRFPStructure(text) {
        if (this.isMock) return this._getMockRFP(text);

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert procurement assistant. Your goal is to extract structured data from a natural language RFP description. Output strictly valid JSON."
                    },
                    {
                        role: "user",
                        content: `Analyze the following request and extract:
- items (name, quantity, specs)
- budget
- delivery_timeline
- warranty_requirements
- terms

Request: ${text}

Output JSON format:
{
  "title": "Short descriptive title",
  "items": [{ "name": "...", "quantity": 0, "specs": "..." }],
  "budget": "...",
  "timeline": "...",
  "warranty": "...",
  "terms": "..."
}`
                    }
                ],
                model: "llama-3.1-8b-instant",
                response_format: { type: "json_object" },
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("AI RFP Generation Error (Falling back to mock):", error.message);
            return this._getMockRFP(text);
        }
    }

    async parseVendorEmail(emailBody) {
        if (this.isMock) return this._getMockEmailParse();

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a data extraction engine. Extract commercial details from the following vendor email text. If data is missing, mark as null."
                    },
                    {
                        role: "user",
                        content: `Email Content:
${emailBody}

Extract the following in JSON:
- vendor_name (if apparent)
- total_price (numeric)
- currency
- line_items (name, price, quantity)
- delivery_timeline
- warranty_offered
- payment_terms`
                    }
                ],
                model: "llama-3.1-8b-instant",
                response_format: { type: "json_object" },
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("AI Email Parsing Error (Falling back to mock):", error.message);
            return this._getMockEmailParse();
        }
    }

    async compareProposals(rfpData, proposals) {
        if (this.isMock) return this._getMockComparison(proposals);

        try {
            console.log("Comparing Proposals. RFP:", JSON.stringify(rfpData).substring(0, 100) + "...");
            console.log("Proposals Input:", JSON.stringify(proposals));

            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a procurement decision support AI. Compare the following proposals against the original RFP requirements."
                    },
                    {
                        role: "user",
                        content: `RFP Requirements: ${JSON.stringify(rfpData)}

Proposals:
${JSON.stringify(proposals)}

Task:
1. Analyze both 'data' (structured) and 'raw_text' (original email).
2. If 'data' is missing fields, infer them from 'raw_text'.
3. Score should be 0 if the proposal does not contains the required items/products and jump to step 5.
4. Score each proposal (0-100) based on Price (30%), Timeline (20%), Specs (20%), Warranty (10%), Terms (10%), Delivery (10%).
5. Recommend the best vendor.
6. Provide a justification.
7. List Pros/Cons for each.
8. Provide a short 'analysis' for each vendor explaining their score.

Output JSON:
{
  "comparison_matrix": [
    { "vendor_id": "...", "score": 85, "analysis": "...", "pros": [], "cons": [] }
  ],
  "recommendation": "Vendor X",
  "justification": "..."
}`
                    }
                ],
                model: "llama-3.1-8b-instant",
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            console.log("AI Comparison Raw Output:", content);
            return JSON.parse(content);
        } catch (error) {
            console.error("AI Comparison Error (Falling back to mock):", error.message);
            return this._getMockComparison(proposals);
        }
    }
}

module.exports = new AIService();
