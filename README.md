# SQL Validation Dashboard

A comprehensive React-based dashboard for analyzing and visualizing SQL validation pipeline results. This application provides interactive tools to upload, analyze, and export SQL test case validation data with beautiful visualizations and detailed drill-down capabilities.

## Features

### 🚀 Core Functionality
- **File Upload**: Support for CSV and JSON file formats
- **Interactive Data Table**: Sortable, filterable table with expandable rows
- **Summary Statistics**: Real-time calculation of pass rates, average scores, and distributions
- **Test Case Details**: Modal views with SQL syntax highlighting
- **Confusion Matrix**: Upload images or display interactive heatmaps
- **Export Capabilities**: Download filtered data as CSV/JSON plus summary reports

### 🎨 UI/UX Features
- **Modern Design**: Clean interface using shadcn/ui components
- **Dark/Light Mode**: Built-in theme switching
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Color-coded Results**: Visual indicators for pass/fail states and score ranges
- **Real-time Filtering**: Search and filter by multiple criteria

### 📊 Analytics & Visualization
- **Pass Rate Tracking**: CodeBERT, FLANE5, and overall match rates
- **Score Distribution**: Excellent, Good, Fair, Poor categorization
- **Metric Analysis**: Syntax scores, semantic scores, n-gram, BLEU, ROUGE
- **Error Analysis**: Failed test identification and unknown token tracking

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd sql-validation-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the dashboard

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Data Format

### Expected CSV Structure
```csv
id,user_prompt,expected_sql,generated_sql,syntax_score,semantic_score,codebert_match,flane5_match,true_label,n_gram_score,bleu_score,rouge_score
test_001,"Select all users","SELECT * FROM users","SELECT * FROM users",1.0,0.95,true,true,"correct",0.98,0.97,0.96
test_002,"Find active users","SELECT * FROM users WHERE active = 1","SELECT * FROM users WHERE status = 'active'",0.8,0.75,false,true,"incorrect",0.65,0.70,0.72
```

### Expected JSON Structure
```json
[
  {
    "id": "test_001",
    "user_prompt": "Select all users",
    "expected_sql": "SELECT * FROM users",
    "generated_sql": "SELECT * FROM users",
    "syntax_score": 1.0,
    "semantic_score": 0.95,
    "codebert_match": true,
    "flane5_match": true,
    "true_label": "correct",
    "n_gram_score": 0.98,
    "bleu_score": 0.97,
    "rouge_score": 0.96,
    "unknown_tokens": []
  }
]
```

### Required Fields
- `id`: Unique test case identifier
- `user_prompt`: Original natural language query
- `expected_sql`: Ground truth SQL query
- `generated_sql`: AI-generated SQL query
- `syntax_score`: Syntax correctness score (0-1)
- `semantic_score`: Semantic similarity score (0-1)
- `codebert_match`: Boolean indicating CodeBERT validation result
- `flane5_match`: Boolean indicating FLANE5 validation result
- `true_label`: Classification label for the test case

### Optional Fields
- `n_gram_score`: N-gram similarity score
- `bleu_score`: BLEU evaluation score
- `rouge_score`: ROUGE evaluation score
- `exact_match`: Boolean for exact string match
- `execution_accuracy`: Query execution accuracy score
- `unknown_tokens`: Array of unrecognized tokens

## Usage Guide

### 1. Upload Your Data
- Drag and drop your CSV or JSON file into the upload area
- The system will automatically parse and validate your data
- You'll see a success message once data is loaded

### 2. Review Summary Statistics
- View overall pass rates and average scores in the summary cards
- Monitor CodeBERT and FLANE5 match rates
- Check score distribution across test cases

### 3. Analyze Individual Cases
- Use the data table to browse all test cases
- Sort by any column (ID, scores, match results)
- Filter by search terms or pass/fail status
- Expand rows to see SQL queries inline
- Click "View" to open detailed modal with syntax highlighting

### 4. Export Results
- Export all data, filtered data, or failed tests only
- Download as CSV or JSON format
- Generate summary reports for stakeholders

### 5. Confusion Matrix Analysis
- Upload confusion matrix images (PNG/JPG)
- View interactive heatmaps if matrix data is provided
- Analyze classification accuracy and error patterns

## Customization

### Adding New Metrics
To add new validation metrics:

1. Update the `SQLTestCase` interface in `src/types/validation.ts`
2. Modify the file upload parsing logic in `src/components/FileUpload.tsx`
3. Add new columns to the data table in `src/components/DataTable.tsx`
4. Update summary calculations in `src/components/SummaryCards.tsx`

### Styling and Themes
The application uses a comprehensive design system:
- Modify `src/index.css` for color schemes and design tokens
- Update `tailwind.config.ts` for theme extensions
- All colors use HSL format and semantic tokens

### Score Thresholds
Customize score categorization in the components:
- Excellent: ≥ 0.9
- Good: 0.7 - 0.9
- Fair: 0.5 - 0.7
- Poor: < 0.5

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Processing**: PapaParse for CSV parsing
- **Syntax Highlighting**: react-syntax-highlighter
- **Charts**: Recharts for visualizations
- **File Handling**: react-dropzone for uploads
- **Themes**: next-themes for dark/light mode

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes

- Optimized for datasets up to 10,000 test cases
- Virtual scrolling for large tables
- Lazy loading for syntax highlighting
- Efficient filtering and sorting algorithms

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.