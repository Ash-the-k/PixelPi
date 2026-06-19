import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../../api/public';
import { Button } from '../ui/Button';
import { AnimatedSection } from '../ui/AnimatedSection';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setServerError('');
    try {
      await api.subscribeNewsletter({ email });
      setSubmitted(true);
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <section
      className="section-padding"
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-base)',
      }}
    >
      <div className="content-container">
        <AnimatedSection>
          <div
            className="flex flex-col items-center text-center gap-6 mx-auto"
            style={{ maxWidth: 'var(--max-width-narrow)' }}
          >
            <div className="flex flex-col gap-3">
              <h2
                className="font-display font-semibold text-display-sm"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Stay in the Loop
              </h2>
              <p
                className="font-body text-body-md"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Engineering updates, project announcements, and occasional deep-dives.
                No noise.
              </p>
            </div>

            {submitted ? (
              <div
                className="w-full py-4 px-6 rounded-lg text-center"
                style={{ background: 'rgba(34, 197, 94, 0.10)', border: '1px solid rgba(34, 197, 94, 0.20)' }}
              >
                <p
                  className="font-body font-medium text-body-sm"
                  style={{ color: 'var(--color-success)' }}
                >
                  You're subscribed. Welcome aboard.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="w-full flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className="w-full h-12 px-4 rounded-md font-body text-body-sm outline-none transition-all duration-fast"
                      style={{
                        background:  'var(--color-bg-elevated)',
                        border:      errors.email
                                       ? '1px solid var(--color-error)'
                                       : '1px solid var(--color-border-strong)',
                        color:       'var(--color-text-primary)',
                      }}
                      onFocus={(e) => {
                        if (!errors.email)
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                      }}
                      onBlur={(e) => {
                        if (!errors.email)
                          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    className="sm:flex-shrink-0"
                  >
                    {isSubmitting ? 'Subscribing…' : 'Subscribe'}
                  </Button>
                </div>

                {errors.email && (
                  <p className="font-body text-caption" style={{ color: 'var(--color-error)' }}>
                    {errors.email.message}
                  </p>
                )}
                {serverError && (
                  <p className="font-body text-caption" style={{ color: 'var(--color-error)' }}>
                    {serverError}
                  </p>
                )}
              </form>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}