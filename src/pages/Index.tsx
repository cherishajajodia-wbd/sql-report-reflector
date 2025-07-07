import { SQLValidationDashboard } from '@/components/SQLValidationDashboard';
import { ThemeProvider } from 'next-themes';

const Index = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SQLValidationDashboard />
    </ThemeProvider>
  );
};

export default Index;
