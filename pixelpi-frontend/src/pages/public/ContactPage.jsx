import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, CheckCircle, Briefcase, MessageSquare, Handshake, ChevronDown } from 'lucide-react';
import { IconWhatsApp } from '../../components/public/ui/SocialIcons';
import { AnimatedSection } from '../../components/public/ui/AnimatedSection';
import { SectionLabel } from '../../components/public/ui/SectionLabel';
import { Divider } from '../../components/public/ui/Divider';
import { api } from '../../api/public';

// ── Types ─────────────────────────────────────────────────────────────────────

const TYPES = [
  { id: 'general',       icon: MessageSquare,  label: 'General Inquiry',  desc: 'Project quotes or general enquiries' },
  { id: 'collaboration', icon: Handshake,  label: 'Collaboration',       desc: 'Industry or Academic partnerships' },
];

const COLLAB_TYPES = ['Industry Partnership', 'Academic Collaboration', 'Other'];

// ── Schemas ───────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name:    z.string().min(2, 'Name required'),
  email:   z.string().email('Valid email required'),
  subject: z.string().min(2, 'Subject required'),
  message: z.string().min(10, 'Message required'),
});

const collaborationSchema = z.object({
  name:    z.string().min(2, 'Name required'),
  email:   z.string().email('Valid email required'),
  company: z.string().min(2, 'Company / institution required'),
  type:    z.string().min(1, 'Select a collaboration type'),
  message: z.string().min(10, 'Message required'),
});

// ── Shared helpers ────────────────────────────────────────────────────────────

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

// ── Form — remounts on type change via key={type} ─────────────────────────────

function InquiryForm({ type }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isCollab = type === 'collaboration';
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(isCollab ? collaborationSchema : contactSchema) });

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      if (isCollab) await api.submitCollaboration(data);
      else          await api.submitContact(data);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Something went wrong. Please try again or email us directly.'
      );
    }
  };

  if (submitted) {
    return (
      <div className="py-16 text-center">
        <CheckCircle size={36} className="mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h3 className="font-display text-display-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Message received.
        </h3>
        <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>
          We'll be in touch within 1–2 business days.
        </p>
      </div>
    );
  }

  const inputCls = 'h-11 px-4';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        </div>

        {isCollab ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label required>Company / Institution</Label>
              <input type="text" className={inputCls} style={inputBase} placeholder="Organization name"
                {...register('company')} onFocus={handleFocus} onBlur={handleBlur} />
              <FieldError message={errors.company?.message} />
            </div>
            <div>
              <Label required>Collaboration Type</Label>
              <div className="relative">
                <select
                  className={inputCls}
                  style={{ ...inputBase, appearance: 'none', paddingRight: '36px' }}
                  {...register('type')}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="">Select type…</option>
                  {COLLAB_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
              <FieldError message={errors.type?.message} />
            </div>
          </div>
        ) : (
          <div>
            <Label required>Subject</Label>
            <input type="text" className={inputCls} style={inputBase} placeholder="What is this regarding?"
              {...register('subject')} onFocus={handleFocus} onBlur={handleBlur} />
            <FieldError message={errors.subject?.message} />
          </div>
        )}

        <div>
          <Label required>Message</Label>
          <textarea
            rows={5}
            className="px-4 py-3 resize-none"
            style={inputBase}
            placeholder={
              isCollab
                ? 'Describe the collaboration opportunity, your goals, and expected timeline…'
                : 'Tell us about your project or inquiry…'
            }
            {...register('message')}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <FieldError message={errors.message?.message} />
        </div>

        {submitError && (
          <p className="font-mono text-mono-sm" style={{ color: 'var(--color-error)' }}>
            {submitError}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-md font-body font-semibold text-label text-white transition-opacity duration-[175ms] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--gradient-brand-button)' }}
          >
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>
        </div>

      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const [type, setType] = useState(
    searchParams.get('type') === 'collaboration' ? 'collaboration' : 'general'
  );

  return (
    <>
      <Helmet>
        <title>Contact | Pixel Pi Technologies</title>
        <meta
          name="description"
          content="Get in touch with Pixel Pi Technologies for service enquiries, collaboration proposals, or general questions."
        />
      </Helmet>

      <section className="section-padding pt-[138px] lg:pt-[10rem]" >
        <div className="content-container">
          <AnimatedSection>
            <SectionLabel>CONTACT</SectionLabel>
            <h1
              className="font-display text-display-lg mt-3 mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Let's Talk
            </h1>
            <p
              className="text-body-lg"
              style={{ color: 'var(--color-text-secondary)', maxWidth: 'var(--max-width-text)' }}
            >
              Whether you have a project in mind, want to explore a partnership, or just have a question — we're reachable.
            </p>
          </AnimatedSection>

          <Divider />

      {/* Form + details */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">

            {/* Left — type selector + contact details */}
            <AnimatedSection className="flex flex-col gap-8">

              <div>
                <p
                  className="font-mono text-mono-sm uppercase tracking-widest mb-4"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  What are you reaching out about?
                </p>
                <div className="flex flex-col gap-3">
                  {TYPES.map(({ id, icon: Icon, label, desc }) => {
                    const active = type === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setType(id)}
                        className="w-full text-left rounded-lg p-4 transition-colors duration-[175ms]"
                        style={{
                          background: active ? 'var(--color-bg-elevated)' : 'transparent',
                          border: active ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-[175ms]"
                            style={{ background: active ? 'var(--color-accent-subtle)' : 'rgba(240,242,248,0.05)' }}
                          >
                            <Icon
                              size={15}
                              strokeWidth={1.75}
                              style={{ color: active ? 'var(--color-accent-hover)' : 'var(--color-text-muted)' }}
                            />
                          </div>
                          <div>
                            <p
                              className="font-body font-medium text-body-sm"
                              style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                            >
                              {label}
                            </p>
                            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                              {desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact details */}
              <div
                className="rounded-lg p-6 flex flex-col gap-5"
                style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
              >
                <p className="font-mono text-mono-sm uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                  Direct Contact
                </p>

                <a
                  href="tel:+918088959143"
                  className="flex items-center gap-3 transition-colors duration-[175ms]"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  <Phone size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <span className="text-body-sm">+91 8088 959 143</span>
                </a>

                <a
                  href="mailto:info@pixelpitechnologies.in"
                  className="flex items-center gap-3 transition-colors duration-[175ms]"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                >
                  <Mail size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <span className="text-body-sm break-all">info@pixelpitechnologies.in</span>
                </a>

                <div className="flex items-center gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin size={15} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  <span className="text-body-sm">Bangalore, Karnataka, India</span>
                </div>

                <div style={{ height: '1px', background: 'var(--color-border)' }} />

                <a
                  href="https://wa.me/918088959143?text=Hello%20Pixel%20Pi%20Technologies!%20I%20would%20like%20to%20inquire%20about%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 h-10 px-4 rounded-md font-mono text-mono-sm transition-all duration-[175ms]"
                  style={{
                    background: 'rgba(15,118,110,0.12)',
                    border: '1px solid rgba(15,118,110,0.25)',
                    color: 'var(--color-whatsapp-hover)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(15,118,110,0.20)';
                    e.currentTarget.style.borderColor = 'rgba(15,118,110,0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(15,118,110,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(15,118,110,0.25)';
                  }}
                >
                  <IconWhatsApp size={15} />
                  Chat on WhatsApp
                </a>
              </div>

            </AnimatedSection>

            {/* Right — form */}
            <AnimatedSection delay={0.1}>
              <InquiryForm key={type} type={type} />
            </AnimatedSection>

          </div>
        </div>
      </section>
    </>
  );
}