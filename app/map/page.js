import CountyMapPageComponent from '../../components/county_map_container';

const MapPage = () => {
    const fipCode = '12095';
    return <CountyMapPageComponent fipCode={fipCode} />;
};

export default MapPage;
