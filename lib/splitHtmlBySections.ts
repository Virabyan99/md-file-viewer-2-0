export function splitHtmlByH2Sections(html: string): string[] {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
  
    const sections: string[] = [];
    let currentSection: HTMLElement | null = null;
  
    Array.from(wrapper.children).forEach((node) => {
      if (node.tagName === 'H2') {
        if (currentSection) {
          sections.push(currentSection!.innerHTML);
        }
        currentSection = document.createElement('div');
        currentSection.appendChild(node.cloneNode(true));
      } else {
        if (!currentSection) {
          currentSection = document.createElement('div');
        }
        currentSection.appendChild(node.cloneNode(true));
      }
    });
  
    if (currentSection) {
      sections.push(currentSection!.innerHTML);
    }
  
    return sections;
}