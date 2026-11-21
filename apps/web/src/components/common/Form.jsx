import { createContext, useContext, useId } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const FieldErrorContext = createContext('');

export function useZodForm(schema, options) {
  return useForm({ ...options, resolver: zodResolver(schema) });
}

export function Form({ methods, onSubmit, children, className }) {
  return (
    <FormProvider {...methods}>
      <form className={className} noValidate onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
}

function FieldFrame({ name, label, children }) {
  const { formState: { errors } } = useFormContext();
  const error = errors[name];
  const message = typeof error?.message === 'string' ? error.message : '';
  const errorId = message ? `${name}-error` : '';
  return (
    <FieldErrorContext.Provider value={errorId}>
      <div className="field">
        {label}
        {children}
        {message && <p id={errorId} className="field-error" role="alert">{message}</p>}
      </div>
    </FieldErrorContext.Provider>
  );
}

function useFieldErrorId() {
  return useContext(FieldErrorContext);
}

export function TextField({ name, label, ...props }) {
  const { register } = useFormContext();
  return (
    <FieldFrame name={name} label={<label htmlFor={name}>{label}</label>}>
      <Input name={name} register={register} {...props} />
    </FieldFrame>
  );
}

function Input({ name, register, ...props }) {
  const errorId = useFieldErrorId();
  return <input id={name} aria-invalid={Boolean(errorId)} aria-describedby={errorId || undefined} {...register(name)} {...props} />;
}

export function TextAreaField({ name, label, rows = 4, ...props }) {
  const { register } = useFormContext();
  return (
    <FieldFrame name={name} label={<label htmlFor={name}>{label}</label>}>
      <Area name={name} register={register} rows={rows} {...props} />
    </FieldFrame>
  );
}

function Area({ name, register, ...props }) {
  const errorId = useFieldErrorId();
  return <textarea id={name} aria-invalid={Boolean(errorId)} aria-describedby={errorId || undefined} {...register(name)} {...props} />;
}

export function SelectField({ name, label, options, placeholder, ...props }) {
  const { register } = useFormContext();
  return (
    <FieldFrame name={name} label={<label htmlFor={name}>{label}</label>}>
      <Select name={name} register={register} options={options} placeholder={placeholder} {...props} />
    </FieldFrame>
  );
}

function Select({ name, register, options, placeholder, ...props }) {
  const errorId = useFieldErrorId();
  return (
    <select id={name} aria-invalid={Boolean(errorId)} aria-describedby={errorId || undefined} {...register(name)} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

export function CheckboxGroup({ name, label, options }) {
  const { register } = useFormContext();
  const labelId = useId();
  return (
    <FieldFrame name={name} label={<span id={labelId}>{label}</span>}>
      <Checks name={name} register={register} options={options} labelId={labelId} />
    </FieldFrame>
  );
}

function Checks({ name, register, options, labelId }) {
  const errorId = useFieldErrorId();
  return (
    <div className="admin-checks" role="group" aria-labelledby={labelId} aria-describedby={errorId || undefined}>
      {options.map((option) => (
        <label key={option.value}>
          <input type="checkbox" value={option.value} {...register(name)} />
          {option.label}
        </label>
      ))}
    </div>
  );
}
