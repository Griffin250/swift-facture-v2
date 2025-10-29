const SectionHeading = ({ id, level = 2, children, className = "" }) => {
  const HeadingTag = `h${level}`;
  
  const baseClasses = {
    2: "text-2xl font-bold text-gray-900 mt-12 mb-6 first:mt-0",
    3: "text-xl font-semibold text-gray-800 mt-8 mb-4",
    4: "text-lg font-medium text-gray-800 mt-6 mb-3",
  };

  return (
    <HeadingTag 
      id={id}
      className={`scroll-mt-24 ${baseClasses[level]} ${className}`}
    >
      {children}
    </HeadingTag>
  );
};

export default SectionHeading;