package com.orange.crawler.service.impl;

import java.util.List;

import com.orange.crawler.bean.Picture;
import com.orange.crawler.dao.PictureDao;
import com.orange.crawler.service.BaseService;


public class BaseServiceImp implements BaseService {
 private PictureDao pictureDao = new PictureDao();
	public List<Picture> getContentByCountryCode(String countryCode) {
		return pictureDao.findByCountry(countryCode);
	}

}
