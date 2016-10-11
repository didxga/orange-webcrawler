package com.orange.crawler.api;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.orange.crawler.bean.Selector;
import com.orange.crawler.dao.SelectorDao;

public class ApiSelector {
	
	private HttpServletRequest request;
	private HttpServletResponse response;
	private SelectorDao selectorDao = new SelectorDao();
	
	ApiSelector(HttpServletRequest request, HttpServletResponse response) {
		this.request = request;
		this.response = response;
	}
	
	public String add() throws IOException {
		String[] paths = this.request.getParameterValues("paths[]");
		String url = this.request.getParameter("url");
		
		if(url != null && paths != null){
			Selector selector = new Selector(url, paths);
			selectorDao.insert(selector);
			return "{\"code\": \"200\"}";
		}
		else{
			return "{\"code\": \"500\", \"message\": \"paths, url are required.\"}";
		}
		
	}
	
	public String edit() {
		return null;
		
	}
	
	public String delete() {
		return null;
		
	}

}
