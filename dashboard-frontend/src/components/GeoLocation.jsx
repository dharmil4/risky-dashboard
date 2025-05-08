// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
// import { useMapContext } from 'react-simple-maps';
// import PropTypes from 'prop-types';

// const geoUrl = "/maps/ne_10m_admin_0_countries.geojson";

// const countryCoordinates = {
//     "India": { lat: 20.5937, lon: 78.9629 },
//     "USA": { lat: 37.0902, lon: -95.7129 },
//     "Germany": { lat: 51.1657, lon: 10.4515 },
//     "Australia": { lat: -25.2744, lon: 133.7751 },
//     "Canada": { lat: 56.1304, lon: -106.3468 },
//     "France": { lat: 46.2276, lon: 2.2137 },
//     "Japan": { lat: 36.2048, lon: 138.2529 },
// };

// const FlowPaths = ({ locations }) => {
//     const { projection } = useMapContext();
//     const paths = [];

//     for (let i = 0; i < locations.length - 1; i++) {
//         const start = countryCoordinates[locations[i].country];
//         const end = countryCoordinates[locations[i + 1].country];

//         if (start && end) {
//             const [x1, y1] = projection([start.lon, start.lat]);
//             const [x2, y2] = projection([end.lon, end.lat]);
//             const midX = (x1 + x2) / 2;
//             const midY = (y1 + y2) / 2 - 50;
//             const pathD = `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
//             paths.push(pathD);
//         }
//     }

//     return (
//         <g>
//             {paths.map((d, idx) => (
//                 <path
//                     key={idx}
//                     d={d}
//                     stroke="#38bdf8"
//                     strokeWidth={0.5}
//                     fill="none"
//                     strokeDasharray="10 5"
//                     style={{ filter: 'drop-shadow(0 0 2px rgba(56, 189, 248, 0.5))' }}
//                 >
//                     <animate
//                         attributeName="stroke-dashoffset"
//                         from="15"
//                         to="0"
//                         dur="2s"
//                         repeatCount="indefinite"
//                     />
//                 </path>
//             ))}
//         </g>
//     );
// };

// const GeolocationMap = ({ title }) => {
//     const [locations, setLocations] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchLocations = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get('http://localhost:4000/api/firewall');
//                 setLocations(response.data.location || []);
//                 console.log(locations)
//                 setError(null);
//             } catch (err) {
//                 console.error('Geolocation API error:', err);
//                 setError('Failed to fetch geolocation data');
//                 setLocations([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchLocations();
//     }, []);

//     if (loading) {
//         return (
//             <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
//                 <h2 className="text-xl font-semibold">{title}</h2>
//                 <div className="text-gray-400 text-center py-16">Loading...</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
//                 <h2 className="text-xl font-semibold">{title}</h2>
//                 <div className="text-red-400 text-center py-16">{error}</div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6">
//             <h2 className="text-xl font-semibold">Geo Location of Alerts</h2>
//             <div className="relative" style={{ paddingBottom: '62.5%' }}>
//                 <ComposableMap
//                     projection="geoEqualEarth"
//                     width={800}
//                     height={500}
//                     style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
//                 >
//                     <Geographies geography={geoUrl}>
//                         {({ geographies }) =>
//                             geographies
//                                 .filter(geo => geo.properties.ADMIN !== "Antarctica")
//                                 .map(geo => (
//                                     <Geography
//                                         key={geo.rsmKey}
//                                         geography={geo}
//                                         fill="#2d3748"
//                                         stroke="#718096"
//                                     />
//                                 ))
//                         }
//                     </Geographies>

//                     {locations.map((loc, idx) => {
//                         const coords = countryCoordinates[loc.country];
//                         if (!coords) return null;
//                         return (
//                             <Marker key={idx} coordinates={[coords.lon, coords.lat]}>
//                                 <circle
//                                     r={5}
//                                     fill="rgba(248, 56, 56, 0.7)"
//                                     stroke="#0ea5e9"
//                                     strokeWidth={1.5}
//                                     style={{ filter: 'drop-shadow(0 0 2px rgba(233, 14, 14, 0.8))' }}
//                                 />
//                                 <text
//                                     textAnchor="middle"
//                                     y={-12}
//                                     style={{ fontFamily: 'system-ui', fill: '#fff', fontSize: '10px' }}
//                                 >
//                                     {loc.country} ({loc.count})
//                                 </text>
//                             </Marker>
//                         );
//                     })}

//                     <FlowPaths locations={locations} />
//                 </ComposableMap>
//             </div>
//         </div>
//     );
// };

// GeolocationMap.propTypes = {
//     title: PropTypes.string,
// };

// GeolocationMap.defaultProps = {
//     title: 'Geolocation of Alerts',
// };

// export default GeolocationMap;


// NEW CODE (pan able code for map)

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
// import { useMapContext } from 'react-simple-maps';
// import PropTypes from 'prop-types';

// const geoUrl = "/maps/ne_10m_admin_0_countries.geojson";

// const countryCoordinates = {
//     "India": { lat: 20.5937, lon: 78.9629 },
//     "USA": { lat: 37.0902, lon: -95.7129 },
//     "Germany": { lat: 51.1657, lon: 10.4515 },
//     "Australia": { lat: -25.2744, lon: 133.7751 },
//     "Canada": { lat: 56.1304, lon: -106.3468 },
//     "France": { lat: 46.2276, lon: 2.2137 },
//     "Japan": { lat: 36.2048, lon: 138.2529 },
// };

// const FlowPaths = ({ locations }) => {
//     const { projection } = useMapContext();
//     const paths = [];

//     for (let i = 0; i < locations.length - 1; i++) {
//         const start = countryCoordinates[locations[i].country];
//         const end = countryCoordinates[locations[i + 1].country];

//         if (start && end) {
//             const [x1, y1] = projection([start.lon, start.lat]);
//             const [x2, y2] = projection([end.lon, end.lat]);
//             const midX = (x1 + x2) / 2;
//             const midY = (y1 + y2) / 2 - 50;
//             const pathD = `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
//             paths.push(pathD);
//         }
//     }

//     return (
//         <g>
//             {paths.map((d, idx) => (
//                 <path
//                     key={idx}
//                     d={d}
//                     stroke="#38bdf8"
//                     strokeWidth={0.5}
//                     fill="none"
//                     strokeDasharray="10 5"
//                     style={{ filter: 'drop-shadow(0 0 2px rgba(56, 189, 248, 0.5))' }}
//                 >
//                     <animate
//                         attributeName="stroke-dashoffset"
//                         from="15"
//                         to="0"
//                         dur="2s"
//                         repeatCount="indefinite"
//                     />
//                 </path>
//             ))}
//         </g>
//     );
// };

// const GeolocationMap = ({ title }) => {
//     const [locations, setLocations] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [zoom, setZoom] = useState(1);
//     const [center, setCenter] = useState([0, 0]);
//     const [isDragging, setIsDragging] = useState(false);

//     useEffect(() => {
//         const fetchLocations = async () => {
//             try {
//                 setLoading(true);
//                 const response = await axios.get('http://localhost:4000/api/firewall');
//                 setLocations(response.data.location || []);
//                 setError(null);
//             } catch (err) {
//                 console.error('Geolocation API error:', err);
//                 setError('Failed to fetch geolocation data');
//                 setLocations([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchLocations();
//     }, []);

//     const handleReset = () => {
//         setZoom(1);
//         setCenter([0, 0]);
//     };

//     const handleMouseDown = () => {
//         setIsDragging(true);
//     };

//     const handleMouseUp = () => {
//         setIsDragging(false);
//     };

//     const handleMove = ({ coordinates, zoom }) => {
//         setCenter(coordinates);
//         setZoom(zoom);
//     };

//     if (loading) {
//         return (
//             <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
//                 <h2 className="text-xl font-semibold">{title}</h2>
//                 <div className="text-gray-400 text-center py-16">Loading...</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
//                 <h2 className="text-xl font-semibold">{title}</h2>
//                 <div className="text-red-400 text-center py-16">{error}</div>
//             </div>
//         );
//     }

//     return (
//         <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6">
//             <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold">Geo Location of Alerts</h2>
//                 <button
//                     onClick={handleReset}
//                     className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
//                 >
//                     Reset Map
//                 </button>
//             </div>
//             <div className="relative" style={{ paddingBottom: '62.5%' }}>
//                 <ComposableMap
//                     projection="geoEqualEarth"
//                     width={800}
//                     height={500}
//                     style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
//                 >
//                     <ZoomableGroup
//                         zoom={zoom}
//                         center={center}
//                         minZoom={0.5}
//                         maxZoom={10}
//                         onMove={handleMove}
//                         onMoveStart={handleMouseDown}
//                         onMoveEnd={handleMouseUp}
//                     >
//                         <Geographies geography={geoUrl}>
//                             {({ geographies }) =>
//                                 geographies
//                                     .filter(geo => geo.properties.ADMIN !== "Antarctica")
//                                     .map(geo => (
//                                         <Geography
//                                             key={geo.rsmKey}
//                                             geography={geo}
//                                             fill="#2d3748"
//                                             stroke="#718096"
//                                             style={{
//                                                 default: { cursor: isDragging ? 'grabbing' : 'grab' },
//                                                 hover: { cursor: isDragging ? 'grabbing' : 'grab' },
//                                                 pressed: { cursor: 'grabbing' },
//                                             }}
//                                         />
//                                     ))
//                             }
//                         </Geographies>

//                         {locations.map((loc, idx) => {
//                             const coords = countryCoordinates[loc.country];
//                             if (!coords) return null;
//                             return (
//                                 <Marker key={idx} coordinates={[coords.lon, coords.lat]}>
//                                     <circle
//                                         r={5}
//                                         fill="rgba(248, 56, 56, 0.7)"
//                                         stroke="#0ea5e9"
//                                         strokeWidth={1.5}
//                                         style={{ filter: 'drop-shadow(0 0 2px rgba(233, 14, 14, 0.8))' }}
//                                     />
//                                     <text
//                                         textAnchor="middle"
//                                         y={-12}
//                                         style={{ fontFamily: 'system-ui', fill: '#fff', fontSize: '10px' }}
//                                     >
//                                         {loc.country} ({loc.count})
//                                     </text>
//                                 </Marker>
//                             );
//                         })}

//                         <FlowPaths locations={locations} />
//                     </ZoomableGroup>
//                 </ComposableMap>
//             </div>
//         </div>
//     );
// };

// GeolocationMap.propTypes = {
//     title: PropTypes.string,
// };

// GeolocationMap.defaultProps = {
//     title: 'Geolocation of Alerts',
// };

// export default GeolocationMap;



// new code with flow direction

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useMapContext } from 'react-simple-maps';

const geoUrl = "/maps/ne_10m_admin_0_countries.geojson";

const countryCoordinates = {
    "India": { lat: 20.5937, lon: 78.9629 },
    "USA": { lat: 37.0902, lon: -95.7129 },
    "Germany": { lat: 51.1657, lon: 10.4515 },
    "Australia": { lat: -25.2744, lon: 133.7751 },
    "Canada": { lat: 56.1304, lon: -106.3468 },
    "France": { lat: 46.2276, lon: 2.2137 },
    "Japan": { lat: 36.2048, lon: 138.2529 },
};

const FlowPaths = ({ locations }) => {
    const { projection } = useMapContext();
    const paths = [];

    for (let i = 0; i < locations.length - 1; i++) {
        const startCountry = locations[i].country;
        const endCountry = locations[i + 1].country;
        const start = countryCoordinates[startCountry];
        const end = countryCoordinates[endCountry];

        if (start && end) {
            const [x1, y1] = projection([start.lon, start.lat]);
            const [x2, y2] = projection([end.lon, end.lat]);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 - 50;
            const pathD = `M${x1},${y1} Q${midX},${midY} ${x2},${y2}`;
            paths.push({ d: pathD });
        }
    }

    return (
        <g>
            <defs>
                <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
            </defs>
            {paths.map((path, idx) => (
                <path
                    key={idx}
                    d={path.d}
                    stroke="#38bdf8"
                    strokeWidth={0.5}
                    fill="none"
                    strokeDasharray="10 5"
                    markerEnd="url(#arrow)"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(56, 189, 248, 0.5))' }}
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from="15"
                        to="0"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </path>
            ))}
        </g>
    );
};

const GeolocationMap = ({ title }) => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:4000/api/firewall');
                setLocations(response.data.location || []);
                setError(null);
            } catch (err) {
                console.error('Geolocation API error:', err);
                setError('Failed to fetch geolocation data');
                setLocations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="text-gray-400 text-center py-16">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-950 text-white rounded-xl p-4 sm:p-6 shadow space-y-4 mt-6">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="text-red-400 text-center py-16">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold">GeoLocation of Alert</h2>
            <div className="relative" style={{ paddingBottom: '62.5%' }}>
                <ComposableMap
                    projection="geoEqualEarth"
                    width={800}
                    height={500}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies
                                .filter(geo => geo.properties.ADMIN !== "Antarctica")
                                .map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#2d3748"
                                        stroke="#718096"
                                    />
                                ))
                        }
                    </Geographies>

                    {locations.map((loc, idx) => {
                        const coords = countryCoordinates[loc.country];
                        if (!coords) return null;
                        return (
                            <Marker key={idx} coordinates={[coords.lon, coords.lat]}>
                                <circle
                                    r={5}
                                    fill="rgba(248, 56, 56, 0.7)"
                                    stroke="#0ea5e9"
                                    strokeWidth={1.5}
                                    style={{ filter: 'drop-shadow(0 0 2px rgba(233, 14, 14, 0.8))' }}
                                />
                                <text
                                    textAnchor="middle"
                                    y={-12}
                                    style={{ fontFamily: 'system-ui', fill: '#fff', fontSize: '10px' }}
                                >
                                    {loc.country} ({loc.count})
                                </text>
                            </Marker>
                        );
                    })}

                    <FlowPaths locations={locations} />
                </ComposableMap>
            </div>
        </div>
    );
};

GeolocationMap.defaultProps = {
    title: 'Geolocation of Alerts',
};

export default GeolocationMap;