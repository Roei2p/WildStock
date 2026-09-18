export const generateN8nWorkflow = (webhookUrl: string) => {
  return {
    name: "WildStock - Wildlife & Raptor Microstock Automation",
    nodes: [
      {
        parameters: {
          httpMethod: "POST",
          path: "wildstock-microstock-trigger",
          responseMode: "lastNode",
          options: {}
        },
        id: "a1b2c3d4-0001-4000-8000-000000000001",
        name: "Webhook Image Ingestion",
        type: "n8n-nodes-base.webhook",
        typeVersion: 2,
        position: [240, 300],
        webhookId: "wildstock-microstock-trigger"
      },
      {
        parameters: {
          method: "POST",
          url: webhookUrl || "https://your-domain.run.app/api/webhook/process",
          sendBody: true,
          contentType: "json",
          bodyParameters: {
            parameters: [
              {
                name: "imageBase64",
                value: "={{ $json.body.imageBase64 || $json.imageBase64 }}"
              },
              {
                name: "imageUrl",
                value: "={{ $json.body.imageUrl || $json.imageUrl }}"
              },
              {
                name: "fileName",
                value: "={{ $json.body.fileName || $json.fileName || 'raptor_photo.jpg' }}"
              }
            ]
          },
          options: {}
        },
        id: "a1b2c3d4-0002-4000-8000-000000000002",
        name: "Gemini Raptor Vision Node",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.2,
        position: [480, 300]
      },
      {
        parameters: {
          jsCode: `// Validate Microstock constraints
const item = $input.first().json;
const title = item.title || "";
const description = item.description || "";
const keywords = item.keywords || "";

const titleWords = title.trim().split(/\\s+/).filter(Boolean).length;
const descWords = description.trim().split(/\\s+/).filter(Boolean).length;
const keywordsArray = keywords.split(',').map(k => k.trim()).filter(Boolean);

return {
  json: {
    rawJson: {
      title,
      description,
      keywords
    },
    validation: {
      titleWords,
      titlePass: titleWords >= 5 && titleWords <= 15,
      descWords,
      descPass: descWords >= 25 && descWords <= 50,
      keywordCount: keywordsArray.length,
      keywordPass: keywordsArray.length >= 30 && keywordsArray.length <= 45
    },
    species: item.species || "Unidentified Wildlife",
    adobeStockKeywords: keywordsArray.slice(0, 50).join(', '),
    shutterstockTitle: title.slice(0, 200),
    freepikTags: keywordsArray.join(','),
    timestamp: new Date().toISOString()
  }
};`
        },
        id: "a1b2c3d4-0003-4000-8000-000000000003",
        name: "Microstock Formatter & Validator",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [720, 300]
      },
      {
        parameters: {
          operation: "toCsv",
          options: {
            headerRow: true
          }
        },
        id: "a1b2c3d4-0004-4000-8000-000000000004",
        name: "Format to Stock CSV",
        type: "n8n-nodes-base.spreadsheetFile",
        typeVersion: 2,
        position: [960, 300]
      }
    ],
    connections: {
      "Webhook Image Ingestion": {
        main: [
          [
            {
              node: "Gemini Raptor Vision Node",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Gemini Raptor Vision Node": {
        main: [
          [
            {
              node: "Microstock Formatter & Validator",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "Microstock Formatter & Validator": {
        main: [
          [
            {
              node: "Format to Stock CSV",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    }
  };
};
