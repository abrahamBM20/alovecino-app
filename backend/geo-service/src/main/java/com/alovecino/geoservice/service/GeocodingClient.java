package com.alovecino.geoservice.service;

import com.alovecino.geoservice.dto.GeocodeRequest;
import com.alovecino.geoservice.dto.GeocodeResponse;

public interface GeocodingClient {

    GeocodeResponse geocode(GeocodeRequest request);
}
