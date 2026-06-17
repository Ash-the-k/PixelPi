export function LogoMark({ size = 'md' }) {
    const sizes = {
        sm: { box: 'w-6 h-6', text: 'text-[10px]', label: 'text-body-md' },
        md: { box: 'w-7 h-7', text: 'text-mono-sm', label: 'text-body-lg' },
        lg: { box: 'w-8 h-8', text: 'text-mono-sm', label: 'text-body-lg' },
    };

    const s = sizes[size] || sizes.md;

    return (
        <div className="inline-flex items-center gap-2">
            <img
                src="/logo.png"
                alt=""
                className={`${s.box} flex-shrink-0 object-contain`}
                aria-hidden="true"
            />
            <span className={`font-display font-semibold ${s.label}`}>
                <span style={{ color: '#332155' }}>Pixel</span>{' '}
                <span style={{ color: '#3B4E93' }}>Pi</span>
            </span>

        </div>
    );
}