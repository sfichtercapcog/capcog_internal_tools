"use client";
import React, { useRef, useState } from "react";
import JSZip from "jszip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileIcon, DownloadIcon, PlusIcon, XIcon, AlertCircleIcon, CheckCircleIcon, UploadCloudIcon } from "lucide-react";

const MEETING_TYPES = [
  "CAECD Board of Managers",
  "CAPCOG Executive Committee",
];

const MEETING_DATES = [
  "09-17-2025",
  "10-08-2025",
  "11-12-2025",
  "12-10-2025",
  "01-14-2026",
  "02-11-2026",
];

const COMMON_KEYWORDS = [
  "budget", "map", "grant", "application", "transportation",
  "public comments", "conformance", "review", "narrative", "plan", "audit", "election",
  "committee", "funding", "amendment", "position", "presentation", "procurement"
];

function sanitizeForFilename(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\-_\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 30);
}

function suggestKeyword(description: string) {
  if (!description) return "";
  const found = COMMON_KEYWORDS.find(kw =>
    description.toLowerCase().includes(kw)
  );
  return found ? found : sanitizeForFilename(description.split(" ")[0] || "item");
}

type AttachmentInput = {
  file: File | null;
  keyword: string;
};

export default function HomePage() {
  const [meetingType, setMeetingType] = useState(MEETING_TYPES[0]);
  const [meetingDate, setMeetingDate] = useState(MEETING_DATES[0]);
  const [agendaFile, setAgendaFile] = useState<File | null>(null);
  const [agendaDesc, setAgendaDesc] = useState("");
  const [agendaTitle, setAgendaTitle] = useState("");
  const [attachments, setAttachments] = useState<AttachmentInput[]>([
    { file: null, keyword: "" },
  ]);
  const [renamedFiles, setRenamedFiles] = useState<{ old: string; new: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const agendaInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (!agendaDesc) {
      setAgendaTitle("");
      return;
    }
    const suggested = suggestKeyword(agendaDesc);
    setAgendaTitle(suggested);
  }, [agendaDesc]);

  const addAttachment = () =>
    setAttachments([...attachments, { file: null, keyword: "" }]);
  const removeAttachment = (idx: number) => {
    if (attachmentInputRefs.current[idx])
      attachmentInputRefs.current[idx]!.value = "";
    setAttachments(attachments.length > 1 ? attachments.filter((_, i) => i !== idx) : attachments);
  };

  React.useEffect(() => {
    const files: { old: string; new: string }[] = [];
    if (agendaFile && agendaTitle) {
      const ext = agendaFile.name.split(".").pop();
      files.push({
        old: agendaFile.name,
        new: `AS_${meetingDate}_${sanitizeForFilename(agendaTitle)}.${ext}`,
      });
    }
    attachments.forEach((att, i) => {
      if (att.file && att.keyword) {
        const ext = att.file.name.split(".").pop();
        files.push({
          old: att.file.name,
          new: `ATT${i + 1}_${meetingDate}_${sanitizeForFilename(att.keyword)}.${ext}`,
        });
      }
    });
    setRenamedFiles(files);
  }, [agendaFile, agendaTitle, meetingDate, attachments]);

  async function handleDownload() {
    setError(null);
    setLoading(true);
    try {
      if (!agendaFile || !agendaTitle)
        throw new Error("Agenda summary file and title required.");
      if (attachments.some(a => !a.file || !a.keyword))
        throw new Error("All attachments must have file and keyword.");

      const zip = new JSZip();
      const agendaExt = agendaFile.name.split(".").pop();
      zip.file(
        `AS_${meetingDate}_${sanitizeForFilename(agendaTitle)}.${agendaExt}`,
        agendaFile
      );
      attachments.forEach((att, i) => {
        const ext = att.file!.name.split(".").pop();
        zip.file(
          `ATT${i + 1}_${meetingDate}_${sanitizeForFilename(att.keyword)}.${ext}`,
          att.file as File
        );
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `MeetingFiles_${meetingDate}.zip`;
      link.click();
      setLoading(false);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unknown error");
      }
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            Meeting Information
          </CardTitle>
          <CardDescription className="text-slate-600">
            Select the meeting type and date for your file package
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-type" className="text-slate-700 font-medium">Meeting Type</Label>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger id="meeting-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-date" className="text-slate-700 font-medium">Meeting Date</Label>
              <Select value={meetingDate} onValueChange={setMeetingDate}>
                <SelectTrigger id="meeting-date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_DATES.map(date => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            Agenda Summary
          </CardTitle>
          <CardDescription className="text-slate-600">
            Upload your agenda file and provide a brief description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="agenda-file" className="text-slate-700 font-medium">Agenda Summary File</Label>
            <div className="relative flex items-center gap-3">
              <input
                ref={agendaInputRef}
                id="agenda-file"
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={e => setAgendaFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => agendaInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <UploadCloudIcon className="w-4 h-4" />
                {agendaFile ? "Replace File" : "Select File"}
              </Button>
              {agendaFile && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FileIcon className="w-4 h-4" />
                  <span className="truncate max-w-[160px]">{agendaFile.name}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setAgendaFile(null);
                      if (agendaInputRef.current) agendaInputRef.current.value = "";
                    }}
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agenda-desc" className="text-slate-700 font-medium">Short Description</Label>
            <Input
              id="agenda-desc"
              type="text"
              placeholder="E.g., Regional Grant Application"
              maxLength={250}
              value={agendaDesc}
              onChange={e => setAgendaDesc(e.target.value)}
            />
            <p className="text-xs text-slate-500">Maximum 50 words</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agenda-title" className="text-slate-700 font-medium">Suggested Title</Label>
            <Input
              id="agenda-title"
              type="text"
              value={agendaTitle}
              onChange={e => setAgendaTitle(e.target.value)}
            />
            <p className="text-xs text-slate-500">Auto-filled from your description. You can edit if needed.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            Attachments
          </CardTitle>
          <CardDescription className="text-slate-600">
            Add supporting documents with descriptive keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {attachments.map((att, idx) => (
            <Card key={idx} className="border border-slate-200 bg-slate-50/50">
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`attachment-file-${idx}`} className="text-slate-700 font-medium">Attachment File</Label>
                    <div className="relative flex items-center gap-3">
                      <input
                        ref={el => { attachmentInputRefs.current[idx] = el; }}
                        id={`attachment-file-${idx}`}
                        type="file"
                        accept=".doc,.docx,.pdf"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          setAttachments(atts => atts.map((a, i) => i === idx ? { ...a, file } : a));
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => attachmentInputRefs.current[idx]?.click()}
                        className="flex items-center gap-2"
                      >
                        <UploadCloudIcon className="w-4 h-4" />
                        {att.file ? "Replace File" : "Select File"}
                      </Button>
                      {att.file && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FileIcon className="w-4 h-4" />
                          <span className="truncate max-w-[160px]">{att.file.name}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setAttachments(atts =>
                                atts.map((a, i) => i === idx ? { ...a, file: null } : a)
                              );
                              if (attachmentInputRefs.current[idx])
                                attachmentInputRefs.current[idx]!.value = "";
                            }}
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`attachment-keyword-${idx}`} className="text-slate-700 font-medium">Keyword</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`attachment-keyword-${idx}`}
                        type="text"
                        placeholder="E.g., map, budget, narrative"
                        maxLength={20}
                        value={att.keyword}
                        onChange={e =>
                          setAttachments(atts =>
                            atts.map((a, i) => i === idx ? { ...a, keyword: e.target.value } : a)
                          )
                        }
                        className="flex-1"
                      />
                      {attachments.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeAttachment(idx)}
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addAttachment}
            className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Another Attachment
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              4
            </div>
            Preview Renamed Files
          </CardTitle>
          <CardDescription className="text-slate-600">
            Review how your files will be renamed before download
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            {renamedFiles.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No files uploaded yet</p>
              </div>
            ) : (
              renamedFiles.map(f => (
                <div key={f.old} className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                  <div className="flex-1 text-sm">
                    <div className="text-slate-600 font-medium">{f.old}</div>
                    <div className="text-xs text-slate-400 mt-1">→</div>
                    <div className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs mt-1">
                      {f.new}
                    </div>
                  </div>
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-slate-800 text-white">
        <CardContent className="pt-6 pb-6">
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            onClick={handleDownload}
            disabled={
              loading ||
              !agendaFile ||
              !agendaTitle ||
              attachments.some(a => !a.file || !a.keyword)
            }
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50 transition-all duration-200"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Packaging Files...
              </>
            ) : (
              <>
                <DownloadIcon className="w-5 h-5 mr-3" />
                Rename & Download ZIP
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
