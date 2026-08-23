/**
 * Renders the editable form for a section's fields, driven entirely by its schema.
 *
 * This is the mechanism behind the brand guardrail. A section type declares its fields in
 * `SECTION_SCHEMAS` — all copy, images, links and booleans, never anything visual — and this
 * component renders exactly those, nothing more. There is no field here for colour, spacing or
 * layout, because the schema never contains one. An administrator fills in content; the design
 * system owns appearance. That is the difference between "manage the website" and "a drag-and-drop
 * builder that lets you break it".
 *
 * A `repeater` field (features, statistics, testimonials) renders as an add/remove/reorder list of
 * sub-forms, bounded by the schema's `max`.
 */

import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import type { SectionField, SectionSchema } from "@/lib/cms/types";
import { asDoc, type EniceDoc } from "@/lib/cms/doc";
import { BlockEditor } from "../editor/BlockEditor";
import { ImageField } from "../MediaPicker";
import { Button, Field, IconButton, Input, Select, Textarea, Toggle } from "../primitives";

type FieldValues = Record<string, unknown>;

export function SectionFieldsForm({
  schema,
  values,
  onChange,
  disabled,
}: {
  schema: SectionSchema;
  values: FieldValues;
  onChange: (values: FieldValues) => void;
  disabled?: boolean;
}) {
  const set = (key: string, value: unknown) => onChange({ ...values, [key]: value });

  return (
    <div className="space-y-5">
      {schema.fields.map((field) => (
        <SingleField
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(value) => set(field.key, value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function SingleField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: SectionField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) {
  switch (field.type) {
    case "text":
      return (
        <Field label={field.label} hint={field.help} required={field.required}>
          {(props) => (
            <Input
              {...props}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(event.target.value)}
              disabled={disabled}
            />
          )}
        </Field>
      );

    case "textarea":
      return (
        <Field label={field.label} hint={field.help} required={field.required}>
          {(props) => (
            <Textarea
              {...props}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(event.target.value)}
              rows={3}
              disabled={disabled}
            />
          )}
        </Field>
      );

    case "url":
      return (
        <Field label={field.label} hint={field.help} required={field.required}>
          {(props) => (
            <Input
              {...props}
              type="url"
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(event.target.value)}
              placeholder="/path or https://…"
              disabled={disabled}
            />
          )}
        </Field>
      );

    case "image":
      return (
        <ImageField
          label={field.label}
          hint={field.help}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          folder="sections"
        />
      );

    case "boolean":
      return (
        <div className="border-border rounded-lg border p-3">
          <Toggle
            checked={value === true}
            onChange={onChange}
            label={field.label}
            description={field.help}
            disabled={disabled}
          />
        </div>
      );

    case "select":
      return (
        <Field label={field.label} hint={field.help} required={field.required}>
          {(props) => (
            <Select
              {...props}
              value={typeof value === "string" ? value : (field.options?.[0] ?? "")}
              onChange={(event) => onChange(event.target.value)}
              disabled={disabled}
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </Field>
      );

    case "richtext":
      return (
        <Field label={field.label} hint={field.help} required={field.required}>
          {() => (
            <div className="border-border rounded-lg border p-4">
              <BlockEditor doc={asDoc(value)} onChange={(doc: EniceDoc) => onChange(doc)} />
            </div>
          )}
        </Field>
      );

    case "repeater":
      return <RepeaterField field={field} value={value} onChange={onChange} disabled={disabled} />;

    default:
      return null;
  }
}

/** An ordered list of sub-forms — features, stats, testimonials — bounded by the schema's `max`. */
function RepeaterField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: SectionField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) {
  const rows = Array.isArray(value) ? (value as FieldValues[]) : [];
  const max = field.max ?? 20;

  const update = (index: number, patch: FieldValues) => {
    const next = [...rows];
    next[index] = patch;
    onChange(next);
  };
  const add = () => {
    // Seed the new row so required sub-fields render with a value rather than `undefined`.
    const blank: FieldValues = {};
    for (const sub of field.of ?? []) blank[sub.key] = sub.type === "boolean" ? false : "";
    onChange([...rows, blank]);
  };
  const remove = (index: number) => onChange(rows.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-foreground text-[12.5px] font-semibold">{field.label}</span>
        <span className="text-muted-foreground text-[11px]">
          {rows.length}
          {max ? ` / ${max}` : ""}
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="border-border bg-secondary/30 rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
                <GripVertical className="h-3 w-3" aria-hidden="true" />
                Item {index + 1}
              </span>
              {!disabled && (
                <div className="flex items-center gap-0.5">
                  <IconButton
                    icon={ChevronUp}
                    label="Move up"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  />
                  <IconButton
                    icon={ChevronDown}
                    label="Move down"
                    size="sm"
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  />
                  <IconButton
                    icon={Trash2}
                    label="Remove item"
                    size="sm"
                    onClick={() => remove(index)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(field.of ?? []).map((sub) => (
                <SingleField
                  key={sub.key}
                  field={sub}
                  value={row[sub.key]}
                  onChange={(subValue) => update(index, { ...row, [sub.key]: subValue })}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!disabled && rows.length < max && (
        <Button variant="outline" icon={Plus} size="sm" className="mt-3" onClick={add}>
          Add {field.label.replace(/s$/, "").toLowerCase()}
        </Button>
      )}
    </div>
  );
}
