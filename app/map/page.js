import CountyMapPageComponent from '../../components/county_map_container';

const MapPage = () => {
    const fipCode = '13121';
    return <CountyMapPageComponent fipCode={fipCode} />;
};

export default MapPage;
