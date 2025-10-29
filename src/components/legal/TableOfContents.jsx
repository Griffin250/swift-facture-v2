import { useEffect, useState } from "react";

const TableOfContents = ({ sections }) => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
      <nav>
        <ul className="space-y-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={`text-left w-full px-3 py-1 rounded transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
                {section.title}
              </button>
              {section.subsections && (
                <ul className="ml-6 mt-1 space-y-1">
                  {section.subsections.map((subsection) => (
                    <li key={subsection.id}>
                      <button
                        onClick={() => scrollToSection(subsection.id)}
                        className={`text-left w-full px-2 py-1 text-sm rounded transition-colors ${
                          activeSection === subsection.id
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        {subsection.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;