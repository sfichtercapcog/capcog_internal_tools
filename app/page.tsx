"use client";
import React, { useRef, useState } from "react";
import JSZip from "jszip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileIcon,
  DownloadIcon,
  PlusIcon,
  XIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  UploadCloudIcon,
  InfoIcon,
  GripVerticalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MEETING_TYPES = ["CAECD Board of Managers", "CAPCOG Executive Committee"];

const MEETING_DATES = [
  "09-17-2025",
  "10-15-2025",
  "11-12-2025",
  "12-10-2025",
  "01-14-2026",
  "02-11-2026",
];

const STOP_WORDS = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "their",
  "there",
  "they",
  "them",
  "we",
  "us",
  "our",
  "you",
  "your",
  "i",
  "me",
  "my",
  "he",
  "him",
  "his",
  "she",
  "her",
  "hers",
];

function sanitizeForFilename(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\-_\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function generateTitle(description: string): {
  title: string;
  wasTruncated: boolean;
} {
  if (!description.trim()) return { title: "", wasTruncated: false };

  const words = description
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !STOP_WORDS.includes(word));

  if (words.length === 0) return { title: "", wasTruncated: false };

  let title = "";
  let wasTruncated = false;

  for (const word of words) {
    const potentialTitle = title ? `${title}_${word}` : word;
    if (potentialTitle.length <= 25) {
      title = potentialTitle;
    } else {
      wasTruncated = true;
      break;
    }
  }

  return { title: title || words[0].substring(0, 25), wasTruncated };
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
  const [titleTruncated, setTitleTruncated] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentInput[]>([
    { file: null, keyword: "" },
  ]);
  const [renamedFiles, setRenamedFiles] = useState<
    { old: string; new: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const agendaInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (!agendaDesc) {
      setAgendaTitle("");
      setTitleTruncated(false);
      return;
    }
    const { title, wasTruncated } = generateTitle(agendaDesc);
    setAgendaTitle(title);
    setTitleTruncated(wasTruncated);
  }, [agendaDesc]);

  const moveAttachment = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= attachments.length) return;

    const newAttachments = [...attachments];
    const [movedItem] = newAttachments.splice(fromIndex, 1);
    newAttachments.splice(toIndex, 0, movedItem);
    setAttachments(newAttachments);
  };

  const addAttachment = () => {
    const lastAttachment = attachments[attachments.length - 1];
    if (lastAttachment && (!lastAttachment.file || !lastAttachment.keyword)) {
      return;
    }
    setAttachments([...attachments, { file: null, keyword: "" }]);
  };
  const removeAttachment = (idx: number) => {
    if (attachmentInputRefs.current[idx])
      attachmentInputRefs.current[idx]!.value = "";
    setAttachments(
      attachments.length > 1
        ? attachments.filter((_, i) => i !== idx)
        : attachments
    );
  };

  React.useEffect(() => {
    const files: { old: string; new: string }[] = [];
    if (agendaFile && agendaTitle) {
      const ext = agendaFile.name.split(".").pop();
      files.push({
        old: agendaFile.name,
        new: `AS_${meetingDate}_${agendaTitle}.${ext}`,
      });
    }
    attachments.forEach((att, i) => {
      if (att.file && att.keyword) {
        const ext = att.file.name.split(".").pop();
        const sanitizedKeyword = sanitizeForFilename(att.keyword);
        files.push({
          old: att.file.name,
          new: `ATT${
            i + 1
          }_${meetingDate}_${agendaTitle}_${sanitizedKeyword}.${ext}`,
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
      if (attachments.some((a) => !a.file || !a.keyword))
        throw new Error("All attachments must have file and keyword.");

      const zip = new JSZip();
      const agendaExt = agendaFile.name.split(".").pop();
      zip.file(`AS_${meetingDate}_${agendaTitle}.${agendaExt}`, agendaFile);
      attachments.forEach((att, i) => {
        const ext = att.file!.name.split(".").pop();
        const sanitizedKeyword = sanitizeForFilename(att.keyword);
        zip.file(
          `ATT${
            i + 1
          }_${meetingDate}_${agendaTitle}_${sanitizedKeyword}.${ext}`,
          att.file as File
        );
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meeting_files_${meetingDate}.zip`;
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
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              Meeting Information
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Choose your meeting type and date. This information will be
                    used to generate standardized file names for easy
                    organization and retrieval.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Select the meeting type and date for your file package
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="meeting-type"
                  className="text-slate-700 font-medium"
                >
                  Meeting Type
                </Label>
                <Select value={meetingType} onValueChange={setMeetingType}>
                  <SelectTrigger id="meeting-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="meeting-date"
                  className="text-slate-700 font-medium"
                >
                  Meeting Date
                </Label>
                <Select value={meetingDate} onValueChange={setMeetingDate}>
                  <SelectTrigger id="meeting-date">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_DATES.map((date) => (
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
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              Agenda Summary
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Upload your main agenda file and describe it briefly. The
                    system will automatically generate a clean, standardized
                    title following naming conventions (25 character limit, no
                    stop words).
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Upload your agenda file and provide a brief description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label
                htmlFor="agenda-file"
                className="text-slate-700 font-medium"
              >
                Agenda Summary File
              </Label>
              <div className="relative flex items-center gap-3">
                <input
                  ref={agendaInputRef}
                  id="agenda-file"
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={(e) => setAgendaFile(e.target.files?.[0] || null)}
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
                    <span className="truncate max-w-[160px]">
                      {agendaFile.name}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setAgendaFile(null);
                        if (agendaInputRef.current)
                          agendaInputRef.current.value = "";
                      }}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="agenda-desc"
                className="text-slate-700 font-medium"
              >
                Short Description
              </Label>
              <Input
                id="agenda-desc"
                type="text"
                placeholder="E.g., Regional Grant Application"
                maxLength={50}
                value={agendaDesc}
                onChange={(e) => setAgendaDesc(e.target.value)}
              />
              <p className="text-xs text-slate-500">Maximum 50 characters</p>
              {titleTruncated && (
                <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
                  <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Title was truncated to fit 25 character limit. Consider
                    shortening your description for a more complete title.
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="agenda-title"
                className="text-slate-700 font-medium"
              >
                Generated Title (Auto-generated)
              </Label>
              <Input
                id="agenda-title"
                type="text"
                value={agendaTitle}
                readOnly
                disabled
                className="bg-slate-100 text-slate-600 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">
                Auto-generated from your description. To change this, edit the
                description above.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              Attachments
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Add supporting documents with unique keywords. Files will be
                    named as ATT1, ATT2, etc. with your keywords. You must
                    complete each attachment (file + keyword) before adding
                    another.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Add supporting documents with descriptive keywords
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {attachments.map((att, idx) => (
              <Card
                key={idx}
                className="border border-slate-200 bg-slate-50/50"
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    {attachments.length > 1 && (
                      <div className="flex flex-col gap-1 pt-6">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-slate-400 hover:text-slate-600"
                          onClick={() => moveAttachment(idx, idx - 1)}
                          disabled={idx === 0}
                        >
                          <ChevronUpIcon className="w-3 h-3" />
                        </Button>
                        <GripVerticalIcon className="w-4 h-4 text-slate-300 mx-auto" />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-slate-400 hover:text-slate-600"
                          onClick={() => moveAttachment(idx, idx + 1)}
                          disabled={idx === attachments.length - 1}
                        >
                          <ChevronDownIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded">
                          ATT{idx + 1}
                        </span>
                        {attachments.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                            onClick={() => removeAttachment(idx)}
                          >
                            <XIcon className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`attachment-file-${idx}`}
                            className="text-slate-700 font-medium"
                          >
                            Attachment File
                          </Label>
                          <div className="relative flex items-center gap-3">
                            <input
                              ref={(el) => {
                                attachmentInputRefs.current[idx] = el;
                              }}
                              id={`attachment-file-${idx}`}
                              type="file"
                              accept=".doc,.docx,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setAttachments((atts) =>
                                  atts.map((a, i) =>
                                    i === idx ? { ...a, file } : a
                                  )
                                );
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                attachmentInputRefs.current[idx]?.click()
                              }
                              className="flex items-center gap-2"
                            >
                              <UploadCloudIcon className="w-4 h-4" />
                              {att.file ? "Replace File" : "Select File"}
                            </Button>
                            {att.file && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <FileIcon className="w-4 h-4" />
                                <span className="truncate max-w-[160px]">
                                  {att.file.name}
                                </span>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setAttachments((atts) =>
                                      atts.map((a, i) =>
                                        i === idx ? { ...a, file: null } : a
                                      )
                                    );
                                    if (attachmentInputRefs.current[idx])
                                      attachmentInputRefs.current[idx]!.value =
                                        "";
                                  }}
                                >
                                  <XIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor={`attachment-keyword-${idx}`}
                            className="text-slate-700 font-medium"
                          >
                            Keyword
                          </Label>
                          <Input
                            id={`attachment-keyword-${idx}`}
                            type="text"
                            placeholder="E.g., map, budget, narrative"
                            maxLength={30}
                            value={att.keyword}
                            onChange={(e) =>
                              setAttachments((atts) =>
                                atts.map((a, i) =>
                                  i === idx
                                    ? { ...a, keyword: e.target.value }
                                    : a
                                )
                              )
                            }
                            className="flex-1"
                          />
                        </div>
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
              disabled={
                attachments.length > 0 &&
                (!attachments[attachments.length - 1].file ||
                  !attachments[attachments.length - 1].keyword)
              }
              className="w-full border-dashed border-2 hover:border-solid hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Another Attachment
            </Button>
            {attachments.length > 0 &&
              (!attachments[attachments.length - 1].file ||
                !attachments[attachments.length - 1].keyword) && (
                <p className="text-xs text-amber-600 text-center">
                  Complete the current attachment before adding another
                </p>
              )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              Preview Renamed Files
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Review the final file names before download. All files
                    follow the standardized naming convention: lowercase,
                    underscores, and descriptive identifiers for easy
                    organization.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Review how your files will be renamed before download
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-slate-50 rounded-lg p-4 space-y-6">
              {renamedFiles.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No files uploaded yet</p>
                </div>
              ) : (
                <>
                  {/* Agenda Summary Section */}
                  {agendaFile && agendaTitle && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                        Agenda Summary
                      </h4>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                        <div className="flex-1 text-sm">
                          <div className="text-slate-600 font-medium">
                            {agendaFile.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">→</div>
                          <div className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs mt-1">
                            {`AS_${meetingDate}_${agendaTitle}.${agendaFile.name
                              .split(".")
                              .pop()}`}
                          </div>
                        </div>
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </div>
                    </div>
                  )}

                  {/* Attachments Section */}
                  {renamedFiles.filter((f) => f.new.startsWith("ATT")).length >
                    0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                        Attachments (
                        {
                          renamedFiles.filter((f) => f.new.startsWith("ATT"))
                            .length
                        }
                        )
                      </h4>
                      <div className="space-y-2">
                        {renamedFiles
                          .filter((f) => f.new.startsWith("ATT"))
                          .map((f) => (
                            <div
                              key={f.old}
                              className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200 shadow-sm"
                            >
                              <div className="flex-1 text-sm">
                                <div className="text-slate-600 font-medium">
                                  {f.old}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  →
                                </div>
                                <div className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs mt-1">
                                  {f.new}
                                </div>
                              </div>
                              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
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
                attachments.some((a) => !a.file || !a.keyword)
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50 transition-all duration-200"
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
    </TooltipProvider>
  );
}
