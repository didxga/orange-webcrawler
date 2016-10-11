package com.orange.crawler.dao;

import java.util.List;

import org.apache.commons.lang.StringEscapeUtils;

import com.orange.crawler.bean.Selector;
import com.orange.crawler.database.DataBaseFactory;

public class SelectorDao {
	private DataBaseFactory dbf = new DataBaseFactory();
	
	public List<Selector> findByUrl(String url){
		String sql = "SELECT * from o_selector where url= "+ quoting(url);
		return dbf.SelectorQuery(sql);
	}
	
	public void insert(Selector selector){
		String sql = "INSERT INTO o_selector VALUES " ;
		String url = selector.getUrl();
		String paths = String.join(",", selector.getPaths());
		sql += "(null, "+quoting(url)+", "+quoting(paths)+")";
		dbf.excute(sql); 
	}
	
	public List<Selector> findAll() {
		String sql = "SELECT * from o_selector";
		return dbf.SelectorQuery(sql);
	}

	private String quoting(String str){
		return "\""+str+"\"" ;
	}
	
	private String escape(String str){
		return StringEscapeUtils.escapeJava(str);
	}

}
