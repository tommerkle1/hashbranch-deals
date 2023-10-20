import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

export async function POST(request: Request) {
  const { data } = await request.json();

  console.log("Received data:", data);

  const result = await extract(data);

  return Response.json(result);
}

const zodSchema = z.object({
  inventory: z
    .array(
      z.object({
        model: z.string().describe("The model of the ASIC server"),
        hashrate: z
          .number()
          .describe(
            "How many TH/s this ASIC server outputs. Denominated as TH or T"
          ),
        isNew: z
          .boolean()
          .optional()
          .describe("Whether this ASIC server is new"),
        moq: z
          .number()
          .optional()
          .describe("The minimum order quantity for this ASIC server"),
        doa: z
          .number()
          .optional()
          .describe("The DOA days for this ASIC server"),
        price: z
          .number()
          .optional()
          .describe("The price per TH for this ASIC server"),
        location: z
          .string()
          .optional()
          .describe("The location of this ASIC server"),
      })
    )
    .describe("An array of ASIC miner inventory mentioned in the WTS message"),
});

const prompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      "List all inventory items in the WTS message. For each item, include the model, is it new?, hashrate (denominated in TH), MOQ, DOA, price, and location."
    ),
    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
  ],
  inputVariables: ["inputText"],
});

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-0613",
  temperature: 0.1,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Binding "function_call" below makes the model always call the specified function.
// If you want to allow the model to call functions selectively, omit it.
const functionCallingModel = llm.bind({
  functions: [
    {
      name: "output_formatter",
      description: "Should always be used to properly format output",
      parameters: zodToJsonSchema(zodSchema),
    },
  ],
  function_call: { name: "output_formatter" },
});

const outputParser = new JsonOutputFunctionsParser();

const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

async function extract(data: string) {
  console.log("Extracting inventory data from the input text...");

  const result = await chain.invoke({
    inputText: data,
  });

  console.log("Extracted inventory data:", result);

  return result;
}
