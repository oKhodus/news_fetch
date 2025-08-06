import dotenv from "dotenv";
dotenv.config();

// check .env var
// console.log(process.env.HF_TOKEN);

const token = process.env.HF_TOKEN;
const model = "Helsinki-NLP/opus-mt-en-uk";

const body = (inp) => {
    return(
        {
            inputs: inp,
            parameters: {
                src_lang: "eng_Latn",
                tgt_lang: "ukr_Cyrl"
            }
        }
    )
};

export async function translate(text) {
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body(text))
    })
    
    const data = await res.json();
    console.log("Переклад:", data[0]?.translation_text || data)

};

translate('Hello everyone, I am Alan. I am living in Baltic State which named Estonia.')


