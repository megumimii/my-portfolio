/**
 * Reusable Key-Value & Custom Links Builder (`<CustomAttributeBuilder />`)
 *
 * Powers flexible custom metadata fields in Interests & Hobbies
 * (e.g. `Key: "Current Game"`, `Value: "Elden Ring"`) as well as custom external links
 * (`label` / `url`) in Projects & Interests.
 */
import styles from './AdminInputs.module.css';

export default function CustomAttributeBuilder({
  label = 'CUSTOM METADATA ATTRIBUTES',
  items = [],
  onChange,
  keyField = 'key',
  valueField = 'value',
  keyPlaceholder = 'Attribute Name (e.g. Platform, Genre, Gear)',
  valuePlaceholder = 'Attribute Value (e.g. PC, Sci-Fi, Sony A7)',
  addButtonLabel = '+ ADD ATTRIBUTE FIELD',
}) {
  const handleAddRow = () => {
    onChange([...items, { [keyField]: '', [valueField]: '' }]);
  };

  const handleUpdateRow = (index, field, val) => {
    const next = items.map((row, idx) =>
      idx === index ? { ...row, [field]: val } : row
    );
    onChange(next);
  };

  const handleRemoveRow = (indexToRemove) => {
    onChange(items.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className={styles.builderContainer}>
      <div className={styles.headerRow}>
        <span className={styles.fieldLabel}>{label}</span>
        <button
          type="button"
          onClick={handleAddRow}
          className={styles.addBtn}
        >
          {addButtonLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className={styles.emptyHint}>
          No custom fields added. Click &ldquo;{addButtonLabel}&rdquo; to define custom pairs.
        </p>
      ) : (
        <div className={styles.pairList}>
          {items.map((item, idx) => (
            <div key={idx} className={styles.pairRow}>
              <input
                type="text"
                value={item[keyField] || ''}
                onChange={(e) => handleUpdateRow(idx, keyField, e.target.value)}
                placeholder={keyPlaceholder}
                className={styles.textInput}
              />
              <input
                type="text"
                value={item[valueField] || ''}
                onChange={(e) => handleUpdateRow(idx, valueField, e.target.value)}
                placeholder={valuePlaceholder}
                className={styles.textInput}
              />
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className={styles.deleteRowBtn}
                aria-label="Remove row"
              >
                [DEL]
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

