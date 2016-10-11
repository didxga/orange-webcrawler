package com.orange.crawler.bean;

public class Selector {

	private int id;
	private String url;
	private String[] paths;
	
	public Selector(int id, String url, String[] paths) {
		super();
		this.id = id;
		this.url = url;
		this.paths = paths;
	}
	
	public Selector(String url, String[] paths) {
		super();
		this.url = url;
		this.paths = paths;
	}

	public int getId() {
		return this.id;
	}
	
	public void setId(int id) {
		this.id = id;
	}
	
	public String getUrl() {
		return this.url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String[] getPaths() {
		return this.paths;
	}
	
	public void setPaths(String[] paths) {
		this.paths = paths;
	}
	
}
