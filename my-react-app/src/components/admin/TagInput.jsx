/**
 * Reusable TagInput Component for Admin CMS
 *
 * Allows adding and removing technology tags or custom interest tags
 * via Enter, comma, or the [+ ADD] button.
 */
import { useState } from 'react';
import styles from './AdminInputs.module.css';

export default function TagInput({
  label = 'TAGS',
  tags = [],
  onChange,
  placeholder = 'Type a tag and press Enter (e.g. React, Python)...',
}) {
  const [inputVal, setInputVal] = useState('');

  const addTag = (raw) => {
    const cleaned = String(raw || '').trim();
    if (!cleaned) return;
    if (!tags.includes(cleaned)) {
      onChange([...tags, cleaned]);
    }
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className={styles.builderContainer}>
      <label className={styles.fieldLabel}>{label}</label>

      <div className={styles.tagInputRow}>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.textInput}
        />
        <button
          type="button"
          onClick={() => addTag(inputVal)}
          className={styles.addBtn}
        >
          + ADD TAG
        </button>
      </div>

      {tags.length > 0 && (
        <div className={styles.chipList}>
          {tags.map((tag, idx) => (
            <span key={idx} className={styles.tagChip}>
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className={styles.removeChipBtn}
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

