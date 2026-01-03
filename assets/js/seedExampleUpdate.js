// Seed Example Monthly Update for March 2026
// This creates a complete example update with all features

import { MonthlyUpdateModel } from "./services/monthlyUpdateModel.js";

export function seedExampleUpdate() {
  const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
  
  // Check if example already exists
  const existingExample = allUpdates.find(u => 
    (u.issueDate === "2026-03" || u.month === "2026-03") && 
    u.title && u.title.includes("März")
  );
  
  if (existingExample) {
    console.log("Example update already exists");
    return existingExample;
  }
  
  // Create example update
  const exampleUpdate = MonthlyUpdateModel.create(
    "2026-03",
    "Innovationsabend im März 2026"
  );
  
  // Set subtitle
  exampleUpdate.subtitle = "Was uns im März bewegt hat";
  
  // Hero Image (using placeholder - in production would be actual image)
  exampleUpdate.heroImage = {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop",
    alt: "Innovationsabend März 2026 - Teilnehmer diskutieren über digitale Transformation im Bauwesen",
    caption: "Teilnehmer des Innovationsabends diskutieren innovative Lösungen",
    focalPoint: { x: 0.5, y: 0.4 }
  };
  
  // Editorial Text
  exampleUpdate.editorialText = `Unser monatlicher Innovationsabend bringt führende Köpfe und junge Talente zusammen, um die Zukunft des Bauwesens zu gestalten. Im März standen drei zentrale Themen im Fokus: Automatisierung im Planungsprozess, nachhaltige Materialinnovationen und die digitale Transformation von Bauprojekten.

Die Veranstaltung bot eine einzigartige Plattform für den Austausch zwischen Architekten, Ingenieuren, Technologieexperten und Startups. Die Diskussionen waren lebhaft und produktiv, mit vielen konkreten Erkenntnissen für die Praxis.`;
  
  // Stats
  exampleUpdate.stats = {
    attendeesCount: 45,
    highlightsCount: 3,
    durationMin: 90
  };
  
  // Highlights
  exampleUpdate.highlights = [
    {
      id: "hl_march_1",
      title: "Automatisierung im Planungsprozess",
      categoryTags: ["AUTOMATION", "BIM", "PROCESS"],
      shortSummary: "Wie KI und Machine Learning den Planungsprozess revolutionieren und Planern mehr Zeit für kreative Aufgaben geben.",
      keyPoints: [
        "1. Intelligentes Design mit KI-Unterstützung",
        "2. Kollaborative Arbeitsabläufe",
        "3. Effizienz-Optimierung durch Automatisierung"
      ],
      media: {
        type: "image",
        image: {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
          alt: "Automatisierung im Planungsprozess - KI-gestützte Architekturplanung",
          caption: "",
          focalPoint: { x: 0.5, y: 0.5 }
        },
        embedUrl: null
      },
      involvedParticipants: [],
      deepDive: {
        enabled: true,
        contentRichText: `<p>Die Automatisierung im Planungsprozess hat in den letzten Jahren enorme Fortschritte gemacht. Moderne BIM-Software kombiniert künstliche Intelligenz mit traditionellen Planungsmethoden, um effizientere und präzisere Ergebnisse zu erzielen.</p>
        
        <p><strong>KI-gestütztes Design:</strong> Algorithmen können nun Muster erkennen, Optimierungsvorschläge machen und sogar erste Entwürfe generieren. Dies gibt Architekten mehr Zeit für kreative und strategische Entscheidungen.</p>
        
        <p><strong>Kollaboration:</strong> Cloud-basierte Plattformen ermöglichen es Teams, in Echtzeit zusammenzuarbeiten, unabhängig von ihrem Standort. Dies reduziert Fehler und beschleunigt den Planungsprozess erheblich.</p>
        
        <p><strong>Effizienz:</strong> Durch die Automatisierung repetitiver Aufgaben können Planer ihre Produktivität um bis zu 40% steigern. Dies führt zu schnelleren Projektabschlüssen und höherer Qualität.</p>`,
        attachments: []
      }
    },
    {
      id: "hl_march_2",
      title: "Nachhaltige Materialinnovationen",
      categoryTags: ["NACHHALTIGKEIT", "MATERIAL", "INNOVATION"],
      shortSummary: "Neue Materialien und Technologien, die den ökologischen Fußabdruck von Bauprojekten reduzieren und gleichzeitig die Performance verbessern.",
      keyPoints: [
        "1. Innovative Wege zu nachhaltigem Beton",
        "2. Moderne Recycling-Technologien",
        "3. Ressourcenschonende Lösungen"
      ],
      media: {
        type: "image",
        image: {
          url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop",
          alt: "Nachhaltige Materialinnovationen - Grüne Baustoffe für die Zukunft",
          caption: "",
          focalPoint: { x: 0.5, y: 0.5 }
        },
        embedUrl: null
      },
      involvedParticipants: [],
      deepDive: {
        enabled: true,
        contentRichText: `<p>Die Bauindustrie steht vor der Herausforderung, nachhaltiger zu werden, ohne Kompromisse bei Qualität und Haltbarkeit einzugehen. Neue Materialinnovationen zeigen vielversprechende Wege auf.</p>
        
        <p><strong>Nachhaltiger Beton:</strong> Forscher entwickeln Betonmischungen, die weniger CO2 emittieren und sogar CO2 aus der Atmosphäre binden können. Diese Innovationen könnten den ökologischen Fußabdruck der Bauindustrie erheblich reduzieren.</p>
        
        <p><strong>Recycling:</strong> Moderne Technologien ermöglichen es, Baustoffe effizienter zu recyceln und wiederzuverwenden. Dies reduziert Abfall und schont natürliche Ressourcen.</p>
        
        <p><strong>Biobasierte Materialien:</strong> Materialien aus nachwachsenden Rohstoffen gewinnen an Bedeutung und bieten eine nachhaltige Alternative zu traditionellen Baustoffen.</p>`,
        attachments: []
      }
    },
    {
      id: "hl_march_3",
      title: "Digitale Transformation im Bauwesen",
      categoryTags: ["DIGITALISIERUNG", "TRANSFORMATION", "TECHNOLOGIE"],
      shortSummary: "Wie digitale Tools und Plattformen die Art und Weise verändern, wie wir bauen, planen und zusammenarbeiten.",
      keyPoints: [
        "1. Cloud-basierte Projektmanagement-Tools",
        "2. Augmented Reality auf der Baustelle",
        "3. Datengetriebene Entscheidungsfindung"
      ],
      media: {
        type: "image",
        image: {
          url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
          alt: "Digitale Transformation im Bauwesen - Moderne Technologien auf der Baustelle",
          caption: "",
          focalPoint: { x: 0.5, y: 0.5 }
        },
        embedUrl: null
      },
      involvedParticipants: [],
      deepDive: {
        enabled: true,
        contentRichText: `<p>Die digitale Transformation erfasst alle Bereiche des Bauwesens - von der ersten Skizze bis zur finalen Übergabe. Diese Entwicklung verändert nicht nur die Technologie, sondern auch die Arbeitsweisen und die Zusammenarbeit.</p>
        
        <p><strong>Cloud-Plattformen:</strong> Moderne Projektmanagement-Tools ermöglichen es allen Beteiligten, in Echtzeit auf aktuelle Informationen zuzugreifen. Dies verbessert die Kommunikation und reduziert Fehler.</p>
        
        <p><strong>Augmented Reality:</strong> AR-Technologien helfen auf der Baustelle, Pläne direkt in die Realität zu projizieren. Dies erleichtert die Umsetzung komplexer Entwürfe und reduziert Fehler.</p>
        
        <p><strong>Datenanalyse:</strong> Durch die Sammlung und Analyse von Projektdaten können Bauunternehmen ihre Prozesse kontinuierlich optimieren und bessere Entscheidungen treffen.</p>`,
        attachments: []
      }
    }
  ];
  
  // Participants (using existing members or creating references)
  const allMembers = JSON.parse(localStorage.getItem("users") || "[]");
  const exampleParticipants = allMembers.slice(0, 8).map((member, idx) => ({
    participantId: member.id,
    role: idx < 2 ? "Architekt" : idx < 4 ? "Ingenieur" : idx < 6 ? "Technologieexperte" : "Startup-Gründer",
    tags: idx % 2 === 0 ? ["BIM", "Innovation"] : ["Nachhaltigkeit", "Digitalisierung"],
    addedAt: new Date().toISOString()
  }));
  
  exampleUpdate.participants = exampleParticipants;
  
  // Assign participants to highlights
  if (exampleUpdate.highlights[0] && exampleParticipants.length >= 2) {
    exampleUpdate.highlights[0].involvedParticipants = [
      exampleParticipants[0].participantId,
      exampleParticipants[1].participantId,
      exampleParticipants[2].participantId
    ];
  }
  if (exampleUpdate.highlights[1] && exampleParticipants.length >= 5) {
    exampleUpdate.highlights[1].involvedParticipants = [
      exampleParticipants[3].participantId,
      exampleParticipants[4].participantId
    ];
  }
  if (exampleUpdate.highlights[2] && exampleParticipants.length >= 7) {
    exampleUpdate.highlights[2].involvedParticipants = [
      exampleParticipants[5].participantId,
      exampleParticipants[6].participantId,
      exampleParticipants[7].participantId
    ];
  }
  
  // Quotes
  exampleUpdate.quotes = [
    {
      id: "qt_march_1",
      text: "Die Automatisierung gibt uns die Möglichkeit, uns auf das zu konzentrieren, was wirklich wichtig ist: kreative Lösungen für komplexe Herausforderungen.",
      sourceName: "Dr. Sarah Müller",
      sourceRole: "Leitende Architektin"
    },
    {
      id: "qt_march_2",
      text: "Nachhaltigkeit ist nicht mehr optional - sie ist der Schlüssel zur Zukunft des Bauwesens.",
      sourceName: "Prof. Michael Schmidt",
      sourceRole: "Forschungsdirektor"
    }
  ];
  
  // Takeaways
  exampleUpdate.takeaways = [
    {
      id: "tk_march_1",
      text: "KI und Automatisierung werden den Planungsprozess fundamental verändern",
      tag: "TECHNOLOGIE"
    },
    {
      id: "tk_march_2",
      text: "Nachhaltige Materialien sind nicht nur umweltfreundlich, sondern auch wirtschaftlich",
      tag: "NACHHALTIGKEIT"
    },
    {
      id: "tk_march_3",
      text: "Die digitale Transformation erfordert eine neue Art der Zusammenarbeit",
      tag: "KOLLABORATION"
    },
    {
      id: "tk_march_4",
      text: "Cloud-basierte Tools werden zum Standard in der Projektabwicklung",
      tag: "TOOLS"
    },
    {
      id: "tk_march_5",
      text: "Startups bringen frische Ideen und agiles Denken in die Branche",
      tag: "INNOVATION"
    }
  ];
  
  // Resources
  exampleUpdate.resources = [
    {
      id: "rs_march_1",
      title: "BIM-Leitfaden 2026",
      url: "https://example.com/bim-guide",
      type: "article",
      note: "Umfassender Leitfaden zu Building Information Modeling"
    },
    {
      id: "rs_march_2",
      title: "Nachhaltiges Bauen - Best Practices",
      url: "https://example.com/sustainable-building",
      type: "article",
      note: "Praktische Tipps für nachhaltiges Bauen"
    },
    {
      id: "rs_march_3",
      title: "Digitalisierung im Bauwesen",
      url: "https://example.com/digitalization",
      type: "video",
      note: "Vortrag zur digitalen Transformation"
    }
  ];
  
  // Next Event
  exampleUpdate.nextEvent = {
    date: "2026-04-15",
    topic: "Innovationsabend April 2026: Smart Cities und urbane Entwicklung",
    ctaLabel: "Jetzt anmelden",
    ctaUrl: "termine.html"
  };
  
  // SEO
  exampleUpdate.seo = {
    metaTitle: "Innovationsabend März 2026 - Automatisierung, Nachhaltigkeit & Digitalisierung",
    metaDescription: "Rückblick auf den Innovationsabend im März 2026 mit Highlights zu Automatisierung im Planungsprozess, nachhaltigen Materialinnovationen und digitaler Transformation im Bauwesen.",
    ogImage: exampleUpdate.heroImage.url
  };
  
  // Status
  exampleUpdate.status = "published";
  exampleUpdate.publishedAt = new Date().toISOString();
  
  // Add to updates array
  allUpdates.unshift(exampleUpdate);
  localStorage.setItem("cms:updates", JSON.stringify(allUpdates));
  
  console.log("✅ Example update for March 2026 created successfully!");
  return exampleUpdate;
}
