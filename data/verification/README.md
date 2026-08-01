# Tokyo Bay Water/Land Validation Dataset Provenance

- **Dataset Owner**: OpenStreetMap Contributors / Japan Ministry of Land, Infrastructure, Transport and Tourism (MLIT)
- **Dataset Title**: Tokyo Bay Coastal & Sumida River Waterway Validation Polygons (v1.1.0-RC.3.6)
- **Source URL**: `https://osmdata.openstreetmap.de/data/land-polygons.html` / `https://nlftp.mlit.go.jp/ksj/`
- **License**: Open Database License (ODbL) / Government of Japan Open Data Terms (Reuse permitted with attribution)
- **Retrieved At**: `2026-07-31T12:00:00Z`
- **Geographic Coverage**: Tokyo Bay Bounding Box `[139.65, 35.55, 139.95, 35.75]` (Encloses all 6 waterbus routes + 2km buffer)
- **Native CRS**: `EPSG:4326 (WGS84)`
- **Derived CRS**: `EPSG:4326 (WGS84)`
- **Raw File SHA-256**: `3296856bb9d1d797ad24976df76278720e1724395f6a1918de7c6f102f800a88`
- **Derived File SHA-256**: `ff57765c5033cbd76a9c2da152fd95b2cfbe45222a896f73c46eeceebbd4054e`
- **Transformation Command**: `npm run prepare:validation-dataset`
- **Tool Version**: Node.js ES Modules / Pure JSON Transformer
- **Known Limitations**:
  - Independent GIS polygon validation input used strictly for segment line-vs-polygon intersection auditing.
  - Route geometry classification remains strictly `approximate-reference` across all 6 routes.
  - Attribution: `© OpenStreetMap contributors | GSI / MLIT Japan`
