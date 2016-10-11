package com.orange.crawler.bean;

public class Picture {
private int id ;
private String text;
private String image;
private String link;
private String path;
private String url;
private String country;
public Picture(int id, String text, String image, String link, String path,
		String url, String country) {
	super();
	this.id = id;
	this.text = text;
	this.image = image;
	this.link = link;
	this.path = path;
	this.url = url;
	this.country = country;
}
public Picture(String text, String image, String link, String path, String url,
		String country) {
	super();
	this.text = text;
	this.image = image;
	this.link = link;
	this.path = path;
	this.url = url;
	this.country = country;
}
public int getId() {
	return id;
}
public void setId(int id) {
	this.id = id;
}
public String getText() {
	return text;
}
public void setText(String text) {
	this.text = text;
}
public String getImage() {
	return image;
}
public void setImage(String image) {
	this.image = image;
}
public String getLink() {
	return link;
}
public void setLink(String link) {
	this.link = link;
}
public String getPath() {
	return path;
}
public void setPath(String path) {
	this.path = path;
}
public String getUrl() {
	return url;
}
public void setUrl(String url) {
	this.url = url;
}
public String getCountry() {
	return country;
}
public void setCountry(String country) {
	this.country = country;
}

}
