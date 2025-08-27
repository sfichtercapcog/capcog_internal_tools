# CAPCOG Internal Tools

An initiative to automate internal CAPCOG workflows for improved accuracy and staff time savings. This comprehensive toolkit helps streamline repetitive administrative tasks, ensuring consistency and reducing manual errors in day-to-day operations.

## Author

Created by **Simon Fichter**, Transportation Planner at CAPCOG

## Current Tools

### File Renamer
A web application for standardizing and packaging meeting files for the Capital Area Planning Council of Governments (CAPCOG). This tool helps rename agenda summaries and attachments according to CAPCOG's naming conventions and packages them into downloadable ZIP files.

## Features

- **Standardized File Naming**: Automatically renames files using CAPCOG's naming convention
- **Meeting Type Selection**: Support for different meeting types (CAECD Board of Managers, CAPCOG Executive Committee)
- **Intelligent Keyword Suggestions**: Auto-suggests keywords based on file descriptions
- **Batch Processing**: Handle multiple attachments in a single package
- **Preview Mode**: Review renamed files before download
- **ZIP Packaging**: Downloads all files in a single ZIP archive
- **Staff Time Savings**: Eliminates manual file renaming and reduces human error
- **Workflow Automation**: Streamlines meeting preparation processes

## File Naming Convention

The application follows this naming pattern:
- **Agenda Summary**: `AS_YYYY-MM-DD_keyword.ext`
- **Attachments**: `ATT#_YYYY-MM-DD_keyword.ext`

Where:
- `AS` = Agenda Summary
- `ATT#` = Attachment number (ATT1, ATT2, etc.)
- `YYYY-MM-DD` = Meeting date
- `keyword` = Descriptive keyword (sanitized and truncated)
- `ext` = Original file extension

## Technology Stack

- **Framework**: Next.js 15.5.2 with React 19
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI primitives with custom components
- **File Processing**: JSZip for archive creation
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/capcog_renamer.git
cd capcog_renamer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Step 1: Meeting Information
- Select the meeting type from the dropdown
- Choose the meeting date from available options

### Step 2: Agenda Summary
- Upload your agenda summary file (PDF, DOC, or DOCX)
- Provide a short description (auto-generates keyword)
- Edit the suggested title if needed

### Step 3: Attachments
- Add attachment files with descriptive keywords
- Use the "Add Another Attachment" button for multiple files
- Remove attachments using the X button

### Step 4: Preview & Download
- Review the renamed file structure
- Click "Rename & Download ZIP" to package and download

## Configuration

### Meeting Types
Currently supports:
- CAECD Board of Managers
- CAPCOG Executive Committee

### Meeting Dates
Pre-configured with upcoming meeting dates. Update the `MEETING_DATES` array in `app/page.tsx` as needed.

### Common Keywords
The application includes common keywords for auto-suggestion:
- budget, map, grant, application, transportation
- public comments, conformance, review, narrative, plan
- audit, election, committee, funding, amendment
- position, presentation, procurement

## File Structure

```
capcog_renamer/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Main application component
├── components/
│   └── ui/               # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── select.tsx
├── lib/
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Meeting Types

1. Update the `MEETING_TYPES` array in `app/page.tsx`
2. Add corresponding logic if different naming conventions are needed

### Adding New Keywords

Update the `COMMON_KEYWORDS` array in `app/page.tsx` to include new auto-suggestion keywords.

## Future Tools

This repository serves as the foundation for additional CAPCOG workflow automation tools. Future enhancements may include:

- Document template generators
- Meeting agenda builders
- Report formatting utilities
- Data validation tools
- Automated compliance checkers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Browser Support

This application works in all modern browsers that support:
- ES6+ JavaScript features
- File API
- Blob API
- Modern CSS features

## Security Notes

- All file processing happens client-side
- No files are uploaded to servers
- Files are processed in-browser using Web APIs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the Capital Area Planning Council of Governments (CAPCOG)
- UI components based on shadcn/ui design system
- Icons provided by Lucide React

## Support

For issues, questions, or contributions, please:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include browser information and steps to reproduce

---

**Note**: This toolkit is designed specifically for CAPCOG internal workflows. The tools are built to improve accuracy, save staff time, and ensure consistency across departmental processes.