<!-- The React App Mounts Here -->
<div id="root"></div>

<!-- Link Vite's compiled build; hashed filenames come from _data/react_assets.json (written by vite build) -->
{% for css in site.data.react_assets.css %}
<link rel="stylesheet" href="{{ '/assets/react-dist/' | append: css | relative_url }}"/>
{% endfor %}
<script type="module" src="{{ '/assets/react-dist/' | append: site.data.react_assets.js | relative_url }}"></script>
