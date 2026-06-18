"use client";

import { useState, useRef } from "react";
import { Copy, Download, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SearchResponse } from "@/lib/types";

interface SearchExportProps {
  results: SearchResponse;
}

function toCSV(results: SearchResponse): string {
  const header = "query,summary,key_points,document_title,excerpt,relevance,score";
  const rows = results.references.map((ref) => {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      esc(results.query),
      esc(results.summary),
      esc(results.key_points.join("; ")),
      esc(ref.document_title),
      esc(ref.excerpt),
      ref.relevance,
      ref.score,
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

function toMarkdown(results: SearchResponse): string {
  const lines: string[] = [];
  lines.push(`# Search: ${results.query}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(results.summary);
  lines.push("");
  if (results.key_points.length > 0) {
    lines.push("## Key Points");
    for (const point of results.key_points) {
      lines.push(`- ${point}`);
    }
    lines.push("");
  }
  if (results.references.length > 0) {
    lines.push(`## Sources (${results.references.length})`);
    lines.push("");
    for (const ref of results.references) {
      lines.push(`### ${ref.document_title} _(relevance: ${ref.relevance}, score: ${ref.score})_`);
      lines.push("");
      lines.push(ref.excerpt);
      lines.push("");
    }
  }
  return lines.join("\n");
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SearchExport({ results }: SearchExportProps) {
  const [copied, setCopied] = useState(false);

  const jsonData = JSON.stringify(results, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              download(jsonData, `cortex-search-${Date.now()}.json`, "application/json")
            }
          >
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => download(toCSV(results), `cortex-search-${Date.now()}.csv`, "text/csv")}
          >
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              download(toMarkdown(results), `cortex-search-${Date.now()}.md`, "text/markdown")
            }
          >
            Export as Markdown
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
