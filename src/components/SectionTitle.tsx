type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionTitleProps) {
  return (
    <div className={`mb-10 max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-leaf">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-base leading-7 text-mint sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
