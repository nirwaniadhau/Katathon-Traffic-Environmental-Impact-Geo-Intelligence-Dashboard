import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadPDFButton({ city, duration }) {
  const download = () => {
    window.open(
      `http://localhost:5000/api/download-report?city=${city}&range=${duration}`
    );
  };

  return (
    <Button onClick={download} className="bg-primary">
      <FileDown className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
}
