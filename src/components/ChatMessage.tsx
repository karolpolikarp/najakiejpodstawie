import { motion } from 'framer-motion';
import { Copy, CheckCheck, Scale, FileText, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const formatAssistantMessage = (content: string) => {
  const sections = content.split('\n\n');
  
  return sections.map((section, idx) => {
    if (section.startsWith('📜 PODSTAWA PRAWNA:')) {
      return (
        <div key={idx} className="mb-4 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">PODSTAWA PRAWNA</h3>
          </div>
          <p className="text-foreground font-medium">{section.replace('📜 PODSTAWA PRAWNA:', '').trim()}</p>
        </div>
      );
    }
    
    if (section.startsWith('📝 CO TO OZNACZA:')) {
      return (
        <div key={idx} className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-foreground" />
            <h3 className="font-semibold">CO TO OZNACZA</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">{section.replace('📝 CO TO OZNACZA:', '').trim()}</p>
        </div>
      );
    }
    
    if (section.startsWith('🔗 ŹRÓDŁO:')) {
      return (
        <div key={idx} className="mb-4 p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-sm">ŹRÓDŁO</h3>
          </div>
          <p className="text-sm text-muted-foreground">{section.replace('🔗 ŹRÓDŁO:', '').trim()}</p>
        </div>
      );
    }
    
    if (section.startsWith('⚠️ UWAGA:')) {
      return (
        <div key={idx} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-sm text-destructive mb-1">UWAGA</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{section.replace('⚠️ UWAGA:', '').trim()}</p>
            </div>
          </div>
        </div>
      );
    }
    
    return <p key={idx} className="mb-2 text-muted-foreground">{section}</p>;
  });
};

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Skopiowano do schowka');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div
        className={`max-w-[85%] rounded-lg ${
          role === 'user'
            ? 'bg-user text-user-foreground p-4'
            : 'bg-assistant text-assistant-foreground border border-border p-5'
        }`}
      >
        {role === 'user' ? (
          <div className="whitespace-pre-wrap break-words">{content}</div>
        ) : (
          <div className="space-y-2">
            {formatAssistantMessage(content)}
          </div>
        )}
        {role === 'assistant' && (
          <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 text-xs"
            >
              {copied ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-accent" />
                  Skopiowano
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Kopiuj
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
