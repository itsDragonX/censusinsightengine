const { useState, useEffect } = React;
const { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis
} = Recharts;

// Reusable Components
const Card = ({ title, children, className = "" }) => (
    <div className={`glass-card ${className}`}>
        {title && <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>{title}</h3>}
        {children}
    </div>
);

const Metric = ({ label, value }) => (
    <Card className="delay-1">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
    </Card>
);

const Spinner = () => (
    <div className="spinner-container">
        <div className="spinner"></div>
    </div>
);

// Pages
const Overview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/overview')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="page-header">
                <h2>Dataset Overview</h2>
                <p>High-level metrics and population distribution across states.</p>
            </div>
            
            <div className="metrics-grid">
                <Metric label="Total Districts Analyzed" value={data.total_districts} />
            </div>

            <div className="charts-grid delay-2">
                <Card title="Top 10 Most Populous States">
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.top_states} margin={{ top: 20, right: 30, left: 40, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="State name" stroke="var(--text-secondary)" angle={-45} textAnchor="end" />
                                <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                                <Bar dataKey="Population" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Sample Data (Top 20)" className="delay-3">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>State</th>
                                <th>District</th>
                                <th>Population</th>
                                <th>Literacy Rate (%)</th>
                                <th>Worker %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.overview_table.map((row, i) => (
                                <tr key={i}>
                                    <td>{row['State name']}</td>
                                    <td>{row['District name']}</td>
                                    <td>{row['Population'].toLocaleString()}</td>
                                    <td>{row['Literacy_Rate'].toFixed(2)}</td>
                                    <td>{row['Worker_Percentage'].toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const Clusters = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/clusters')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <Spinner />;

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

    return (
        <div>
            <div className="page-header">
                <h2>Demographic Clusters</h2>
                <p>Districts grouped into 4 clusters based on Literacy, Workers, Youth, and Digital Penetration.</p>
            </div>

            <div className="charts-grid delay-1">
                <Card title="Literacy vs Worker Percentage">
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid stroke="var(--border-color)" />
                                <XAxis type="number" dataKey="Literacy_Rate" name="Literacy Rate" stroke="var(--text-secondary)" unit="%" />
                                <YAxis type="number" dataKey="Worker_Percentage" name="Worker %" stroke="var(--text-secondary)" unit="%" />
                                <ZAxis type="category" dataKey="Demographic_Cluster" name="Cluster" />
                                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                                {[0,1,2,3].map(clusterId => (
                                    <Scatter key={clusterId} name={`Cluster ${clusterId}`} data={data.filter(d => d.Demographic_Cluster === clusterId)} fill={colors[clusterId]} />
                                ))}
                                <Legend />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Youth vs Digital Penetration">
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid stroke="var(--border-color)" />
                                <XAxis type="number" dataKey="Youth_Percentage" name="Youth %" stroke="var(--text-secondary)" unit="%" />
                                <YAxis type="number" dataKey="Digital_Penetration" name="Digital %" stroke="var(--text-secondary)" unit="%" />
                                <ZAxis type="category" dataKey="Demographic_Cluster" name="Cluster" />
                                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                                {[0,1,2,3].map(clusterId => (
                                    <Scatter key={clusterId} name={`Cluster ${clusterId}`} data={data.filter(d => d.Demographic_Cluster === clusterId)} fill={colors[clusterId]} />
                                ))}
                                <Legend />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const Infrastructure = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('education');

    useEffect(() => {
        fetch('/api/infrastructure')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="page-header">
                <h2>Priority Infrastructure Gaps</h2>
                <p>Regions most in need of specific infrastructure development based on demographic factors.</p>
            </div>

            <div className="tabs delay-1">
                <div className={`tab ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>Educational</div>
                <div className={`tab ${activeTab === 'sanitation' ? 'active' : ''}`} onClick={() => setActiveTab('sanitation')}>Sanitation</div>
                <div className={`tab ${activeTab === 'digital' ? 'active' : ''}`} onClick={() => setActiveTab('digital')}>Digital Connectivity</div>
            </div>

            <Card className="delay-2">
                {activeTab === 'education' && (
                    <div>
                        <h3 style={{color: 'var(--accent-blue)', marginBottom: '1rem'}}>High Priority: Education Infrastructure</h3>
                        <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Districts with high proportion of young people but low higher education rates.</p>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>District</th><th>State</th><th>Need Score</th><th>Youth %</th><th>Higher Ed %</th></tr>
                                </thead>
                                <tbody>
                                    {data.education.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r['District name']}</td><td>{r['State name']}</td>
                                            <td>{r['Education_Need_Score'].toFixed(2)}</td>
                                            <td>{r['Youth_Percentage'].toFixed(2)}</td><td>{r['Higher_Ed_Percentage'].toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'sanitation' && (
                    <div>
                        <h3 style={{color: 'var(--accent-green)', marginBottom: '1rem'}}>High Priority: Sanitation Infrastructure</h3>
                        <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Districts with highest % of households without latrine facilities.</p>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>District</th><th>State</th><th>Sanitation Need Score (%)</th></tr>
                                </thead>
                                <tbody>
                                    {data.sanitation.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r['District name']}</td><td>{r['State name']}</td>
                                            <td>{r['Sanitation_Need_Score'].toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'digital' && (
                    <div>
                        <h3 style={{color: 'var(--accent-purple)', marginBottom: '1rem'}}>High Priority: Digital Infrastructure</h3>
                        <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>Districts with the lowest % of households with computers or internet.</p>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>District</th><th>State</th><th>Digital Penetration (%)</th></tr>
                                </thead>
                                <tbody>
                                    {data.digital.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r['District name']}</td><td>{r['State name']}</td>
                                            <td>{r['Digital_Penetration'].toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

const SearchDistrict = () => {
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [distData, setDistData] = useState(null);

    useEffect(() => {
        fetch('/api/states').then(res => res.json()).then(d => { setStates(d.states); setSelectedState(d.states[0]); });
    }, []);

    useEffect(() => {
        if (selectedState) {
            fetch(`/api/districts/${encodeURIComponent(selectedState)}`)
                .then(res => res.json())
                .then(d => { setDistricts(d.districts); setSelectedDistrict(d.districts[0]); });
        }
    }, [selectedState]);

    useEffect(() => {
        if (selectedState && selectedDistrict) {
            fetch(`/api/district_details/${encodeURIComponent(selectedState)}/${encodeURIComponent(selectedDistrict)}`)
                .then(res => res.json())
                .then(d => setDistData(d));
        }
    }, [selectedState, selectedDistrict]);

    return (
        <div>
            <div className="page-header">
                <h2>Search District Details</h2>
                <p>View detailed demographic and infrastructure metrics for any district.</p>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}} className="delay-1">
                <div style={{flex: 1}}>
                    <label className="metric-label" style={{display:'block', marginBottom:'0.5rem'}}>Select State</label>
                    <select className="select-input" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div style={{flex: 1}}>
                    <label className="metric-label" style={{display:'block', marginBottom:'0.5rem'}}>Select District</label>
                    <select className="select-input" value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            {distData && (
                <div className="delay-2">
                    <h3 style={{marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Details for {distData['District name']}, {distData['State name']}</h3>
                    <div className="metrics-grid">
                        <Metric label="Total Population" value={distData['Population'].toLocaleString()} />
                        <Metric label="Literacy Rate" value={`${distData['Literacy_Rate'].toFixed(2)}%`} />
                        <Metric label="Worker Percentage" value={`${distData['Worker_Percentage'].toFixed(2)}%`} />
                        <Metric label="Youth Percentage (0-29)" value={`${distData['Youth_Percentage'].toFixed(2)}%`} />
                        <Metric label="Digital Penetration" value={`${distData['Digital_Penetration'].toFixed(2)}%`} />
                    </div>
                    
                    <h3 style={{margin: '2rem 0 1.5rem', color: 'var(--text-primary)'}}>Need Scores (Higher = More Need)</h3>
                    <div className="metrics-grid delay-3">
                        <Metric label="Education Need Score" value={distData['Education_Need_Score'].toFixed(2)} />
                        <Metric label="Sanitation Need Score" value={distData['Sanitation_Need_Score'].toFixed(2)} />
                    </div>
                </div>
            )}
        </div>
    );
};

const SearchNeed = () => {
    const [needType, setNeedType] = useState('sanitation'); // sanitation, education, digital
    const [topN, setTopN] = useState(15);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/needs/${needType}?top_n=${topN}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(err => console.error(err));
    }, [needType, topN]);

    const getMetricInfo = () => {
        if (needType === 'sanitation') return { key: 'Sanitation_Need_Score', title: 'Sanitation Need Score (%)' };
        if (needType === 'education') return { key: 'Education_Need_Score', title: 'Education Need Score' };
        return { key: 'Digital_Penetration', title: 'Digital Penetration (%)' };
    };

    const metricInfo = getMetricInfo();

    return (
        <div>
            <div className="page-header">
                <h2>Search by Infrastructure Need</h2>
                <p>Identify regions across India that need the most attention for specific infrastructure.</p>
            </div>

            <Card className="delay-1" style={{marginBottom: '2rem'}}>
                <div style={{display: 'flex', gap: '2rem'}}>
                    <div style={{flex: 1}}>
                        <label className="metric-label" style={{display:'block', marginBottom:'0.5rem'}}>Select Need Type</label>
                        <select className="select-input" value={needType} onChange={e => setNeedType(e.target.value)}>
                            <option value="sanitation">Poor Health & Sanitation</option>
                            <option value="education">Education Infrastructure</option>
                            <option value="digital">Digital Connectivity</option>
                        </select>
                    </div>
                    <div style={{flex: 1}}>
                        <label className="metric-label" style={{display:'block', marginBottom:'0.5rem'}}>Show Top {topN} Districts</label>
                        <input type="range" className="range-input" min="5" max="50" step="5" value={topN} onChange={e => setTopN(parseInt(e.target.value))} />
                    </div>
                </div>
            </Card>

            {loading ? <Spinner /> : (
                <div className="delay-2">
                    <Card title={`Top ${topN} Districts for ${needType.toUpperCase()}`}>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="District name" stroke="var(--text-secondary)" angle={-45} textAnchor="end" />
                                    <YAxis stroke="var(--text-secondary)" />
                                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                                    <Bar dataKey={metricInfo.key} name={metricInfo.title} fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card style={{marginTop: '2rem'}} className="delay-3">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>State</th><th>District</th><th>{metricInfo.title}</th><th>Population</th></tr>
                                </thead>
                                <tbody>
                                    {data.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r['State name']}</td>
                                            <td>{r['District name']}</td>
                                            <td>{r[metricInfo.key].toFixed(2)}</td>
                                            <td>{r['Population'].toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

// Main App Component
const App = () => {
    const [currentPage, setCurrentPage] = useState('overview');

    const renderPage = () => {
        switch (currentPage) {
            case 'overview': return <Overview />;
            case 'clusters': return <Clusters />;
            case 'infrastructure': return <Infrastructure />;
            case 'searchDistrict': return <SearchDistrict />;
            case 'searchNeed': return <SearchNeed />;
            default: return <Overview />;
        }
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span style={{fontSize: '1.5rem'}}>🌍</span>
                    <h1>Census Insights</h1>
                </div>
                
                <div className="nav-section">
                    <div className="nav-section-title">Insights & Details</div>
                    <div className={`nav-item ${currentPage === 'overview' ? 'active' : ''}`} onClick={() => setCurrentPage('overview')}>
                        Overview
                    </div>
                    <div className={`nav-item ${currentPage === 'clusters' ? 'active' : ''}`} onClick={() => setCurrentPage('clusters')}>
                        Demographics & Clustering
                    </div>
                    <div className={`nav-item ${currentPage === 'infrastructure' ? 'active' : ''}`} onClick={() => setCurrentPage('infrastructure')}>
                        Infrastructure Gaps
                    </div>
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">Search Tools</div>
                    <div className={`nav-item ${currentPage === 'searchDistrict' ? 'active' : ''}`} onClick={() => setCurrentPage('searchDistrict')}>
                        Search District
                    </div>
                    <div className={`nav-item ${currentPage === 'searchNeed' ? 'active' : ''}`} onClick={() => setCurrentPage('searchNeed')}>
                        Search by Need
                    </div>
                </div>
            </aside>
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
