require('dotenv').config();
const OpenAI = require('openai');

async function testKey() {
    console.log("Testing OpenAI Key...");
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("❌ No API Key found in .env");
        return;
    }

    console.log(`Key found: ${apiKey.substring(0, 10)}...`);

    const openai = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
    });

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say hello" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("✅ Success! Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("\n❌ API Request Failed!");
        console.error("Error Code:", error.code);
        console.error("Error Type:", error.type);
        console.error("Message:", error.message);

        if (error.code === 'insufficient_quota') {
            console.log("\n💡 EXPLANATION: 'insufficient_quota' means your account has no credits.");
            console.log("   Even if you haven't used the key, free trial credits expire after 3 months.");
            console.log("   You need to add a payment method at https://platform.openai.com/billing/overview");
        }
    }
}

testKey();
