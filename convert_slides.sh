#!/bin/bash

echo "🎯 Convertisseur de Slides - Secure Document Management Platform"
echo ""

# Check if pandoc is installed
if ! command -v pandoc &> /dev/null; then
    echo "⚠️ Pandoc n'est pas installé."
    echo "💡 Pour installer:"
    echo "  - macOS: brew install pandoc"
    echo "  - Ubuntu: sudo apt-get install pandoc"
    echo "  - Windows: https://pandoc.org/installing.html"
    echo ""
    echo "📋 Alternatives:"
    echo "  - Utiliser reveal.js: https://revealjs.com/"
    echo "  - Importer PRESENTATION_SLIDES.md dans GitPitch"
    echo "  - Copier le contenu dans Google Slides/PowerPoint"
    exit 1
fi

echo "✅ Pandoc détecté"
echo ""

# Convert to PowerPoint
echo "🔄 Conversion en PowerPoint..."
pandoc PRESENTATION_SLIDES.md -o presentation.pptx -t pptx
if [ $? -eq 0 ]; then
    echo "✅ Fichier créé: presentation.pptx"
else
    echo "❌ Erreur lors de la conversion PowerPoint"
fi

# Convert to HTML reveal.js
echo "🔄 Conversion en HTML reveal.js..."
pandoc PRESENTATION_SLIDES.md -o presentation.html -t revealjs -s
if [ $? -eq 0 ]; then
    echo "✅ Fichier créé: presentation.html"
    echo "💡 Ouvrir avec: open presentation.html"
else
    echo "❌ Erreur lors de la conversion HTML"
fi

# Convert to PDF
echo "🔄 Conversion en PDF..."
pandoc PRESENTATION_SLIDES.md -o presentation.pdf -t beamer
if [ $? -eq 0 ]; then
    echo "✅ Fichier créé: presentation.pdf"
else
    echo "❌ Erreur lors de la conversion PDF"
fi

echo ""
echo "🎉 Conversion terminée !"
echo ""
echo "📄 Fichiers disponibles:"
echo "  - presentation.pptx (PowerPoint)"
echo "  - presentation.html (Reveal.js)"
echo "  - presentation.pdf (PDF)"
echo ""
echo "💡 Conseils:"
echo "  - Ouvrir le .pptx dans PowerPoint/LibreOffice"
echo "  - Ouvrir le .html dans un navigateur"
echo "  - Modifier le style avec des thèmes reveal.js" 