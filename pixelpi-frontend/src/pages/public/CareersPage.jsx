import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Clock, Users, CheckCircle, ChevronDown } from 'lucide-react';
import { useCareerOpenings } from '../../hooks/useCareerOpenings';
import { AnimatedSection } from '../../components/public/ui/AnimatedSection';
import { StaggerGrid } from '../../components/public/ui/StaggerGrid';
import { SectionLabel } from '../../components/public/ui/SectionLabel';
import { Divider } from '../../components/public/ui/Divider';
import { api } from '../../api/public';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png', 'image/jpeg',
];

// ── Form schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(6, 'Phone required'),
  position: z.string().min(1, 'Select a position'),
  education: z.string().min(2, 'Education level required'),
  university: z.string().min(2, 'Institution required'),
  skills: z.string().min(10, 'Describe your skills (min 10 characters)'),
  experience: z.string().optional(),
  portfolio: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  message: z.string().optional(),
  resume: z
    .any()
    .refine((f) => f instanceof FileList && f.length > 0, 'Resume is required')
    .refine((f) => !(f instanceof FileList) || f[0]?.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine((f) => !(f instanceof FileList) || ALLOWED_TYPES.includes(f[0]?.type), 'PDF, DOC, DOCX, PNG, or JPG only'),
});

// ── Shared input helpers ──────────────────────────────────────────────────────

const inputBase = {
  background: 'rgba(13,18,32,0.70)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
  width: '100%',
  transition: 'border-color 175ms, box-shadow 175ms',
  outline: 'none',
};

const handleFocus = (e) => {
  e.target.style.borderColor = 'var(--color-accent)';
  e.target.style.boxShadow = '0 0 0 3px var(--color-accent-subtle)';
};
const handleBlur = (e) => {
  e.target.style.borderColor = 'var(--color-border)';
  e.target.style.boxShadow = 'none';
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className="font-mono text-mono-sm mt-1.5" style={{ color: 'var(--color-error)' }}>{message}</p>;
}

function Label({ children, required }) {
  return (
    <label className="block text-label mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
      {children}{required && <span style={{ color: 'var(--color-error)' }}> *</span>}
    </label>
  );
}

function GroupLabel({ children }) {
  return (
    <p
      className="font-mono text-mono-sm uppercase tracking-widest mb-5"
      style={{ color: 'var(--color-accent)' }}
    >
      {children}
    </p>
  );
}

// ── Opening card ──────────────────────────────────────────────────────────────

function OpeningCard({ opening, onApply }) {
  const requirements = opening.requirements
  ?.split('\n')
  .map(r => r.trim())
  .filter(Boolean) ?? [];

  return (
    <div
      className="flex flex-col gap-5 p-7 rounded-lg h-full"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div>
        {opening.department && (
          <p className="font-mono text-mono-sm mb-2" style={{ color: 'var(--color-accent)' }}>
            {opening.department}
          </p>
        )}
        <h3 className="font-display text-display-sm" style={{ color: 'var(--color-text-primary)' }}>
          {opening.title}
        </h3>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4">
        {opening.location && (
          <span className="flex items-center gap-1.5 font-mono text-mono-sm" style={{ color: 'var(--color-text-muted)' }}>
            <MapPin size={11} /> {opening.location}
          </span>
        )}
        {opening.type && (
          <span className="flex items-center gap-1.5 font-mono text-mono-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Clock size={11} /> {opening.type}
          </span>
        )}
        {opening.positions && (
          <span className="flex items-center gap-1.5 font-mono text-mono-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Users size={11} /> {opening.positions} open
          </span>
        )}
      </div>

      {opening.description && (
        <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {opening.description}
        </p>
      )}

      {/* Key requirements */}
      {requirements.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-mono-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Requirements
          </span>
          <ul className="flex flex-col gap-1.5">
            {requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {/* mt-[7px] centers the dot with the first line of 14px/1.6 text */}
                <span
                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--color-accent)', marginTop: '8px' }}
                />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-2">
        <a
          href="#apply"
          onClick={() => onApply(opening.title)}
          className="inline-flex items-center gap-2 font-mono text-mono-sm transition-colors duration-[175ms]"
          style={{ color: 'var(--color-accent)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
}

// ── Application form ──────────────────────────────────────────────────────────

function ApplicationForm({ openings, defaultPosition }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resumeLabel, setResumeLabel] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  // Pre-select position when "Apply Now" is clicked on an opening card
  useEffect(() => {
    if (defaultPosition) setValue('position', defaultPosition);
  }, [defaultPosition, setValue]);

  const resumeReg = register('resume');

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (key === 'resume') formData.append('resume', val[0]);
        else formData.append(key, val ?? '');
      });
      await api.submitApplication(formData);
      setSubmitted(true);
      reset();
      setResumeLabel('');
    } catch (err) {
      setSubmitError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Something went wrong. Please try again or email us at info@pixelpitechnologies.in'
      );
    }
  };

  if (submitted) {
    return (
      <div
        className="rounded-lg p-10 text-center"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        <CheckCircle size={36} className="mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h3 className="font-display text-display-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Application submitted.
        </h3>
        <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          We review every application and will be in touch if there's a fit.
        </p>
      </div>
    );
  }

  const inputCls = 'h-11 px-4';
  const textareaCls = 'px-4 py-3 resize-none';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div
        className="rounded-lg p-6 md:p-8 flex flex-col gap-0"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', maxWidth: 'var(--max-width-article)', margin: '0 auto' }}
      >

        {/* Group 1 — Personal Details */}
        <div className="pb-8">
          <GroupLabel>Personal Details</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label required>Full Name</Label>
              <input type="text" className={inputCls} style={inputBase} placeholder="Jane Smith"
                {...register('name')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label required>Email</Label>
              <input type="email" className={inputCls} style={inputBase} placeholder="jane@example.com"
                {...register('email')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.email?.message} />
            </div>
            <div className="md:col-span-2">
              <Label required>Phone</Label>
              <input type="tel" className={inputCls} style={inputBase} placeholder="+91 98765 43210"
                {...register('phone')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '32px' }} />

        {/* Group 2 — Position */}
        <div className="pb-8">
          <GroupLabel>Position</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Label required>Role</Label>
              <div className="relative">
                <select
                  className={inputCls}
                  style={{ ...inputBase, appearance: 'none', paddingRight: '36px' }}
                  {...register('position')}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select a position…</option>
                  {openings.map((o) => (
                    <option key={o.id} value={o.title}>{o.title}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
              <FieldError message={errors.position?.message} />
            </div>
            <div>
              <Label required>Education Level</Label>
              <input type="text" className={inputCls} style={inputBase} placeholder="B.Tech / M.Tech / B.Sc…"
                {...register('education')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.education?.message} />
            </div>
            <div>
              <Label required>Institution</Label>
              <input type="text" className={inputCls} style={inputBase} placeholder="University or college name"
                {...register('university')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.university?.message} />
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '32px' }} />

        {/* Group 3 — Background */}
        <div className="pb-8">
          <GroupLabel>Background</GroupLabel>
          <div className="flex flex-col gap-5">
            <div>
              <Label required>Skills</Label>
              <textarea rows={3} className={textareaCls} style={inputBase}
                placeholder="C/C++, Python, ESP32, PCB design, React…"
                {...register('skills')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.skills?.message} />
            </div>
            <div>
              <Label>Experience</Label>
              <textarea rows={3} className={textareaCls} style={inputBase}
                placeholder="Relevant projects, internships, or coursework…"
                {...register('experience')} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--color-border)', marginBottom: '32px' }} />

        {/* Group 4 — Submission */}
        <div className="pb-8">
          <GroupLabel>Submission</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Portfolio / GitHub</Label>
              <input type="url" className={inputCls} style={inputBase}
                placeholder="https://github.com/yourhandle"
                {...register('portfolio')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.portfolio?.message} />
            </div>
            <div>
              <Label required>Resume</Label>
              <div
                className="h-11 flex items-center gap-3 px-4 rounded-md relative cursor-pointer"
                style={{ border: '1px solid var(--color-border)', background: 'rgba(13,18,32,0.70)' }}
              >
                <span
                  className="text-body-sm flex-1 truncate"
                  style={{ color: resumeLabel ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
                >
                  {resumeLabel || 'PDF, DOC, DOCX — max 5MB'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  {...resumeReg}
                  onChange={(e) => {
                    resumeReg.onChange(e);
                    setResumeLabel(e.target.files?.[0]?.name || '');
                  }}
                />
              </div>
              <FieldError message={errors.resume?.message} />
            </div>
            <div className="md:col-span-2">
              <Label>Cover Note</Label>
              <textarea rows={3} className={textareaCls} style={inputBase}
                placeholder="Anything else you'd like us to know…"
                {...register('message')} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-3">
          {submitError && (
            <p className="font-mono text-mono-sm" style={{ color: 'var(--color-error)' }}>
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-md font-body font-semibold text-label text-white transition-opacity duration-[175ms] disabled:opacity-50 disabled:cursor-not-allowed self-start"
            style={{ background: 'var(--gradient-brand-button)' }}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>

      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CareersPage() {
  const { data: openings = [], isLoading, error } = useCareerOpenings();
  const [defaultPosition, setDefaultPosition] = useState('');

  return (
    <>
      <Helmet>
        <title>Careers | Pixel Pi Technologies</title>
        <meta
          name="description"
          content="Open internship positions at Pixel Pi Technologies in embedded systems and application development."
        />
      </Helmet>

      {/* ── Section 1: Hero + Openings ── */}
      <section className="section-padding pt-[138px] lg:pt-[10rem]">
        <div className="content-container">

          <AnimatedSection>
            <SectionLabel>JOIN US</SectionLabel>
            <h1
              className="font-display text-display-lg mt-3 mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Build the Future with Us
            </h1>
            <p
              className="text-body-lg"
              style={{ color: 'var(--color-text-secondary)', maxWidth: 'var(--max-width-text)' }}
            >
              We're building intelligent engineering solutions across IoT, embedded systems, and space technology.
              Join a team that ships real work.
            </p>
          </AnimatedSection>

          <Divider />

          <AnimatedSection className="mb-10">
            <SectionLabel>OPEN POSITIONS</SectionLabel>
            <h2 className="font-display text-display-md mt-3" style={{ color: 'var(--color-text-primary)' }}>
              Current Openings
            </h2>
          </AnimatedSection>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-lg h-52 animate-pulse"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }} />
              ))}
            </div>
          )}
          {error && !isLoading && (
            <p className="font-mono text-mono-sm" style={{ color: 'var(--color-text-muted)' }}>
              Could not load openings.
            </p>
          )}
          {!isLoading && !error && openings.length === 0 && (
            <p className="text-body-md" style={{ color: 'var(--color-text-muted)' }}>
              No open positions at the moment — check back soon.
            </p>
          )}
          {!isLoading && !error && openings.length > 0 && (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {openings.map((o) => (
                <OpeningCard key={o.id} opening={o} onApply={setDefaultPosition} />
              ))}
            </StaggerGrid>
          )}

        </div>
      </section>

      {/* Application Form — bg-subtle */}
      <section
        className="section-padding"
        id="apply"
        style={{ background: 'var(--color-bg-subtle)', scrollMarginTop: '80px' }}
      >
        <div className="content-container">

          <AnimatedSection className="mb-10">
            <SectionLabel>APPLY</SectionLabel>
            <h2 className="font-display text-display-md mt-3" style={{ color: 'var(--color-text-primary)' }}>
              Apply Now
            </h2>
          </AnimatedSection>
          

          <AnimatedSection delay={0.05}>
            <ApplicationForm openings={openings} defaultPosition={defaultPosition} />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}