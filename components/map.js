'use client'

import dynamic from 'next/dynamic';

const CountyMapComponent = dynamic(() => import('../../components/county_map'), { ssr: false });

const MapPage = () => {

    return (
        <div>
            <CountyMapComponent fipCodes={[13121]}></CountyMapComponent>
        </div>
    )
}

export default MapPage;