import { AnalysisResult, BatchItem } from '../types';

export function exportBatchToCsv(items: BatchItem[], filename = 'wildstock_microstock_metadata.csv') {
  const completedResults = items
    .map((item) => item.result)
    .filter((res): res is AnalysisResult => res !== undefined);

  if (completedResults.length === 0) {
    alert('No analyzed items to export. Process at least one image first.');
    return;
  }

  // Headers standard across Adobe Stock & Shutterstock CSV ingestion
  const headers = [
    'Filename',
    'Title',
    'Description',
    'Keywords',
    'Categories',
    'Species_Common',
    'Species_Scientific',
  ];

  const escapeCsv = (str: string) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = completedResults.map((item) => {
    return [
      escapeCsv(item.fileName),
      escapeCsv(item.rawJson.title),
      escapeCsv(item.rawJson.description),
      escapeCsv(item.rawJson.keywords),
      escapeCsv('Animals, Nature, Wildlife'),
      escapeCsv(item.species.commonName),
      escapeCsv(item.species.scientificName),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
