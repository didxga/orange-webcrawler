package com.orange.crawler.dao;

import java.util.List;

import org.apache.commons.lang.StringEscapeUtils;

import com.orange.crawler.bean.Picture;
import com.orange.crawler.database.DataBaseFactory;

public class PictureDao {
private DataBaseFactory dbf = new DataBaseFactory();
public List<Picture> findByCountry(String code){
	String sql = "select * from o_pic where country= "+ quoting(code);
	return dbf.PictureQuery(sql);
}
public boolean deleteByURLAndPath(String url, String path) {
	String sql = "delete from o_pic where url= "+ quoting(url) + " and path=" + quoting(path);
	return dbf.excute(sql);
}
public boolean deleteByCountry(String... codeArr){
	if(codeArr!=null){
		int  len = codeArr.length;
		String sql = "";
		if(len==1){
			 sql = "DELETE FROM o_pic WHERE country = "+quoting(codeArr[0]);
		}
		else if(len>1){
			String key = "" ;
			for(int i = 0 ; i < len-1 ;i++){
				key+=codeArr[i] ;
				key+=", " ;
			}
			key+=codeArr[len-1];
			sql = "DELETE FROM o_pic WHERE country IN ("+quoting(key)+")";
		}
		else{
			return false ;
		}
		 return  dbf.excute(sql);
	}
	return false ;
}

public List<Picture> findByCountry(String url, String path) {
	String sql = "select * from o_pic where url= "+ quoting(url) + " and path=" + quoting(path);
	return dbf.PictureQuery(sql);
}

public boolean insert(List<Picture> picList){
	//INSERT INTO table (field1,field2,field3) VALUES ('a',"b","c"), ('a',"b","c"),('a',"b","c"); can not use
	//("text", "country", "url", "path", "image" "link" )
	String sql = "INSERT INTO o_pic VALUES " ;
	for(Picture pic : picList){
		String uuid = pic.getUrl()+pic.getPath();
		
		String text = pic.getText();
		String country = pic.getCountry();
		String url = pic.getUrl();
		String path = pic.getPath();
		String image = pic.getImage();
		String link = pic.getLink();
		sql += "( null ," + quoting(text) +", "+quoting(country)+", "+quoting(url)+", "+quoting(escape(path))+", "+quoting(image)+", "+quoting(link)+" ) ,";
	}
	return dbf.excute(sql.substring(0,sql.length()-1)); 
}

private String quoting (String str){
	return "\""+str+"\"" ;
}
private String escape (String str){
	return StringEscapeUtils.escapeJava(str);
}

}
