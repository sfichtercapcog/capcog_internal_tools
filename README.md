# RPS File Naming & Attachment Manager

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Internal_Use-red)](#license)

A modern Next.js application designed to standardize and automate file naming for internal RPS (Regional Planning Services) teams. This tool ensures consistent, organized file management for meeting documents and attachments while maintaining strict naming conventions.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [File Naming Convention](#file-naming-convention)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Features

### Core Functionality

- ✅ **Standardized File Naming**: Automatically generates clean, consistent file names following organizational conventions
- ✅ **Meeting Type & Date Selection**: Pre-configured options for CAECD Board of Managers and CAPCOG Executive Committee meetings
- ✅ **Intelligent Title Generation**: Rules-based title creation with stop-word filtering and 25-character limit
- ✅ **Progressive Workflow**: Step 3 (Attachments) is disabled until Step 2 (Agenda Summary) is completed
- ✅ **Attachment Management**: Support for multiple attachments with unique keywords and sequential numbering
- ✅ **Real-time Preview**: Live preview of renamed files before download
- ✅ **Drag & Drop Reordering**: Intuitive attachment reordering to control ATT1, ATT2, etc. sequence
- ✅ **Client-Side Processing**: All file processing happens locally in the browser for maximum security

### Smart Processing

- **Stop Word Filtering**: Removes common words (the, and, of, etc.) from generated titles
- **Character Limits**: User input limited to 50 characters, titles capped at 25 characters
- **Word Preservation**: Truncates at word boundaries to maintain readability
- **Input Validation**: Prevents incomplete submissions and enforces file+keyword requirements
- **Sanitization**: Converts spaces to underscores, ensures lowercase output

## Demo

🚀 **Live Application**: [http://localhost:3000](http://localhost:3000) (when running locally)

### Screenshot

_Application interface showing the 4-step file naming process with gradient step indicators and tooltips for user guidance._

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18.0 or higher
- npm (comes with Node.js) or [yarn](https://yarnpkg.com/)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/sfichtercapcog/capcog_internal_tools.git
   cd capcog_renamer
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Step-by-Step Guide

#### Step 1: Meeting Information

- Select your meeting type from the dropdown menu
- Choose the appropriate meeting date
- This information will be embedded in all generated file names

#### Step 2: Agenda Summary

- Upload your main agenda file (`.doc`, `.docx`, `.pdf`)
- Provide a brief description (50 character maximum)
- The system automatically generates a clean title using your description
- Watch for truncation warnings if your description is too long
- **Required**: This step must be completed before attachments can be added

#### Step 3: Attachments

- **Prerequisites**: Complete Step 2 (Agenda Summary) first to unlock this section
- Add supporting documents with descriptive keywords
- Each attachment gets a sequential number (ATT1, ATT2, etc.)
- Use the up/down arrows to reorder attachments as needed
- Both file and keyword are required before adding another attachment

#### Step 4: Preview & Download

- Review all renamed files before downloading
- Agenda Summary and Attachments are clearly separated
- Click "Rename & Download ZIP" to get your organized file package

## File Naming Convention

### Output Format

- **Agenda Summary**: `AS_YYYY-MM-DD_generated_title.ext`
- **Attachments**: `ATT1_YYYY-MM-DD_generated_title_keyword.ext`, `ATT2_YYYY-MM-DD_generated_title_keyword.ext`, etc.
- **ZIP Package**: `meeting_files_YYYY-MM-DD.zip`

### Example Output

```
meeting_files_2025-08-27.zip
├── AS_2025-08-27_fy25-26_grant_application.pdf
├── ATT1_2025-08-27_fy25-26_grant_application_budget.xlsx
├── ATT2_2025-08-27_fy25-26_grant_application_map.pdf
└── ATT3_2025-08-27_fy25-26_grant_application_narrative.docx
```

### Title Generation Rules

1. Convert input to lowercase
2. Remove special characters (except hyphens)
3. Filter out stop words (the, and, of, etc.)
4. Replace spaces with underscores
5. Truncate at word boundaries if over 25 characters
6. Display warning if truncation occurs

## Development

### Tech Stack

- **Framework**: [Next.js 15.5.2](https://nextjs.org/) with [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Language**: [TypeScript](https://www.typescriptlang.org/) for full type safety
- **File Processing**: [JSZip](https://stuk.github.io/jszip/) for creating downloadable archives
- **Icons**: [Lucide React](https://lucide.dev/)

### Project Structure

```
capcog_renamer/
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout with header
│   └── globals.css       # Global styles
├── components/ui/        # Reusable UI components (shadcn/ui)
├── lib/
│   └── utils.ts         # Utility functions
├── public/              # Static assets
└── README.md           # Project documentation
```

### Key Functions

- `generateTitle()`: Processes user input into standardized titles
- `sanitizeForFilename()`: Ensures safe filename characters
- `moveAttachment()`: Handles attachment reordering
- `handleDownload()`: Creates and triggers ZIP download

### Design System

- **Color Coding**: Blue (Step 1) → Orange (Step 2) → Purple (Step 3) → Green (Step 4)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG 2.1 compliant color contrasts and focus states
- **User Experience**: Tooltips, loading states, and clear error messaging

### Getting Started with Development

1. **Fork the repository** (for external contributors)
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test your changes**
   ```bash
   npm run build
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## Contributing

This is an internal tool for CAPCOG RPS staff. For feature requests, bug reports, or contributions:

1. **Internal Team Members**: Contact the author directly
2. **External Contributors**: Please reach out to the author before making contributions

### Bug Reports

When reporting bugs, please include:

- Operating system and browser version
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots if applicable

## License

**Internal Use Only** - This software is proprietary and intended solely for internal use by CAPCOG RPS staff. Not for public distribution.

## Author

**Simon Fichter**  
_Transportation Planner_  
Capital Area Council of Governments (CAPCOG)  
📧 [Contact via email](sfichter@capcog.org)

### About the Author

Simon Fichter is a Transportation Planner at CAPCOG, with a special interest in workflow automation and process improvement. This tool was developed to streamline internal document management processes and ensure consistency across meeting materials.

## Acknowledgments

- **CAPCOG RPS Leadership** for supporting internal tool development initiatives
- **RPS Team** for providing requirements and testing feedback
- **shadcn/ui** for the excellent component library
- **Next.js Team** for the robust React framework
- **Open Source Community** for the underlying technologies that make this tool possible

---

<div align="center">

**Built with ❤️ for CAPCOG RPS**

_Streamlining document management workflows since 2025_

[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Powered by TypeScript](https://img.shields.io/badge/Powered_by-TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)

</div>
