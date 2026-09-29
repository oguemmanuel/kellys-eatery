import "server-only";
import QRCode from "qrcode";

// Brand green on white. High error correction so a smudged or folded flyer
// still scans.
const OPTIONS = {
  errorCorrectionLevel: "H",
  margin: 2,
  color: { dark: "#1d5128", light: "#ffffff" },
} as const;

export function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...OPTIONS, type: "svg" });
}

// 2048px is sharp enough to print at A4 size.
export function qrPng(url: string, width = 2048): Promise<Buffer> {
  return QRCode.toBuffer(url, { ...OPTIONS, type: "png", width });
}
