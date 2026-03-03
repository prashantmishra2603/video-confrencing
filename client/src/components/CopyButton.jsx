import React, { useState, useEffect } from 'react';
import Button from './Button';

const CopyButton = ({ text, label = 'Copy Link' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button
      onClick={handleCopy}
      variant={copied ? 'primary' : 'secondary'}
      size="sm"
      className="transition-all"
    >
      {copied ? '✅ Copied!' : label}
    </Button>
  );
};

export default CopyButton;
