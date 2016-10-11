package com.orange.crawler.service;

import java.util.List;

import com.orange.crawler.bean.Picture;

public interface BaseService {
	public List<Picture> getContentByCountryCode(String countryCode);
}
