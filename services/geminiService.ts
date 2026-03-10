
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { CarState } from "../types";

const controlCarFeatureDeclaration: FunctionDeclaration = {
  name: 'controlCarFeature',
  parameters: {
    type: Type.OBJECT,
    description: 'Controla funcionalidades específicas do Peugeot e-2008, como luzes, trancagem, ar condicionado ou modo de condução.',
    properties: {
      feature: {
        type: Type.STRING,
        description: 'A funcionalidade a controlar.',
        enum: ['lightsOn', 'locked', 'climateOn', 'drivingMode'],
      },
      value: {
        type: Type.STRING,
        description: 'O valor para a funcionalidade. Para luzes, lock e climate use "true" ou "false". Para drivingMode use "Eco", "Comfort" ou "Sport".',
      }
    },
    required: ['feature', 'value'],
  },
};

export const getSmartInsights = async (state: CarState): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Como assistente inteligente Peugeot e-GT, analisa: Bateria ${state.batteryLevel}%, Autonomia ${state.rangeKm}km, Modo ${state.drivingMode}. O condutor chama-se Leonardo. Dá 2 conselhos ultra-curtos e premium.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text || "";
    return text.split('\n').filter(t => t.trim().length > 0).slice(0, 2);
  } catch (error) {
    return ["Sistemas Peugeot optimizados.", "Bateria em condições ideais."];
  }
};

export const processUserCommand = async (command: string, currentState: CarState) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O utilizador Leonardo disse: "${command}". O estado atual é: ${JSON.stringify(currentState)}. Use as ferramentas para ajudar o utilizador ou responda educadamente.`,
      config: {
        tools: [{ functionDeclarations: [controlCarFeatureDeclaration] }],
      },
    });

    return {
      text: response.text,
      functionCalls: response.functionCalls
    };
  } catch (error) {
    console.error("AI Command Error:", error);
    return { text: "Desculpe Leonardo, houve um erro na conexão com o sistema central.", functionCalls: [] };
  }
};
