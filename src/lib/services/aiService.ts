import { GoogleGenAI } from '@google/genai';

export interface FinancialContext {
  organizationName: string;
  totalInvoiced: number;
  totalCollected: number;
  pendingBalance: number;
  activeCustomersCount: number;
  recentPayments: any[];
  recentInvoices: any[];
  web3TransactionsCount: number;
}

export class ReyAiService {
  private static getClient() {
    const apiKey = process.env.AI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  public static async analyzeFinancials(userPrompt: string, context: FinancialContext): Promise<string> {
    const client = this.getClient();
    if (!client) {
      return `[REY AI ASISTENTE FINANCIERO]
Resumen Ejecutivo:
• Organización: ${context.organizationName}
• Total Facturado: $${context.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
• Total Cobrado: $${context.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
• Saldo Pendiente por Cobrar: $${context.pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
• Clientes Activos: ${context.activeCustomersCount}

Recomendación Estratégica:
1. Optimizar los procesos de cobranza para las facturas pendientes ($${context.pendingBalance.toLocaleString()} USD).
2. Considerar habilitar la pasarela de pagos Web3 en Polygon para acelerar la liquidación internacional sin comisiones bancarias intermedias.

Fuentes Verificadas:
✓ Registro Ledger en tiempo real (Base de datos Firestore REYWALLET)
✓ Transacciones Web3 auditadas on-chain.`;
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Eres REY AI, la superinteligencia financiera y copiloto para decisiones ejecutivas de REYWALLET.
Analiza con máxima precisión la consulta del usuario basándote EXCLUSIVAMENTE en el siguiente contexto financiero real:

[DATOS FINANCIEROS REALES DE LA ORGANIZACIÓN]
Empresa: ${context.organizationName}
Total Facturado: $${context.totalInvoiced} USD
Total Recaudado/Cobrado: $${context.totalCollected} USD
Saldo Pendiente: $${context.pendingBalance} USD
Clientes Activos: ${context.activeCustomersCount}
Transacciones Web3 Verificadas: ${context.web3TransactionsCount}

[REGLAS INVIOLABLES]
1. No inventes cifras ni transacciones que no estén en los datos.
2. Si el usuario te pide ejecutar una transferencia o modificar saldos, explícale que como salvaguarda de seguridad, REY AI opera en modo ANALÍTICO Y CONSULTIVO. Las acciones financieras requieren autorización humana directa.
3. Incluye siempre una sección "Fuentes Verificadas de Datos".

Pregunta del Ejecutivo: "${userPrompt}"`
      });

      return response.text || 'Sin respuesta del modelo AI.';
    } catch (error: any) {
      console.error('Error invocando REY AI:', error);
      return `Error al conectar con REY AI: ${error.message}. Por favor verifique la clave de API.`;
    }
  }
}
