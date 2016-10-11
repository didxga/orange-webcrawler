package com.orange.crawler.database;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.tomcat.jdbc.pool.DataSource;

import com.orange.crawler.bean.Picture;
import com.orange.crawler.bean.Selector;

public  class DataBaseFactory {

	private static final Log log = LogFactory.getLog(DataBaseFactory.class);
	
	private Connection getConnection() throws InterruptedException, ExecutionException, NamingException, SQLException{
		Context sourceCtx = new InitialContext();
		DataSource ds = (DataSource) sourceCtx
				.lookup("java:comp/env/jdbc/mysql");
		Future<Connection> future = ds.getConnectionAsync();
		    while (!future.isDone()) {
		    	log.info("Connection is not yet available. Do some background work");
		      try {
		        Thread.sleep(100); //simulate work
		      }catch (InterruptedException x) {
		        Thread.currentThread().interrupt();
		      }
		    }
		    return  future.get();
	}
		
	
	public  List<Selector> SelectorQuery(String sql) {
		Connection conn = null;
		Statement stmt = null; // Or PreparedStatement if needed
		ResultSet rs = null;
		try {   
			conn = getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery(sql);
			List<Selector> result = new ArrayList<Selector>();
			 while (rs.next()) {
				 //Picture(int id, String name, String image, String link, String path,String url, String country)
				 result.add(new Selector(
						 Integer.parseInt(rs.getString("id")),
						 rs.getString("url"),
						 rs.getString("paths").split(",")
						 )
				);
			 }
			rs.close();
			rs = null;
			stmt.close();
			stmt = null;
			conn.close(); // Return to connection pool
			conn = null; // Make sure we don't close it twice
			return  result;
		} catch (Exception e) {
			if (rs != null) {
				try {rs.close();} catch (SQLException e1) {
					e.printStackTrace();
				}
				rs = null;
			}
			if (stmt != null) {
				try {stmt.close();}catch (SQLException e2) {
					e.printStackTrace();
				}
				stmt = null;
			}
			if (conn != null) {
				try {conn.close();} catch (SQLException e3) {
					e.printStackTrace();
				}
				conn = null;
			}
			e.printStackTrace();
			return null ;
		} finally {
			// Always make sure result sets and statements are closed,
			// and the connection is returned to the pool
			if (rs != null) {
				try {rs.close();} catch (SQLException e) {
					e.printStackTrace();
				}
				rs = null;
			}
			if (stmt != null) {
				try {stmt.close();}catch (SQLException e) {
					e.printStackTrace();
				}
				stmt = null;
			}
			if (conn != null) {
				try {conn.close();} catch (SQLException e) {
					e.printStackTrace();
				}
				conn = null;
			}
			
		}
		
	}
	
	public  List<Picture> PictureQuery(String sql) {
		Connection conn = null;
		Statement stmt = null; // Or PreparedStatement if needed
		ResultSet rs = null;
		try {   
			conn = getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery(sql);
			List<Picture> result = new ArrayList<Picture>();
			 while (rs.next()) {
				 //Picture(int id, String name, String image, String link, String path,String url, String country)
				 result.add(new Picture(Integer.parseInt(rs.getString("id")),rs.getString("name"),rs.getString("image"),
						 rs.getString("link"),rs.getString("path"),rs.getString("url"),rs.getString("country")));
			 }
			rs.close();
			rs = null;
			stmt.close();
			stmt = null;
			conn.close(); // Return to connection pool
			conn = null; // Make sure we don't close it twice
			return  result ;
		} catch (Exception e) {
			if (rs != null) {
				try {rs.close();} catch (SQLException e1) {
					e.printStackTrace();
				}
				rs = null;
			}
			if (stmt != null) {
				try {stmt.close();}catch (SQLException e2) {
					e.printStackTrace();
				}
				stmt = null;
			}
			if (conn != null) {
				try {conn.close();} catch (SQLException e3) {
					e.printStackTrace();
				}
				conn = null;
			}
			e.printStackTrace();
			return null ;
		} finally {
			// Always make sure result sets and statements are closed,
			// and the connection is returned to the pool
			if (rs != null) {
				try {rs.close();} catch (SQLException e) {
					e.printStackTrace();
				}
				rs = null;
			}
			if (stmt != null) {
				try {stmt.close();}catch (SQLException e) {
					e.printStackTrace();
				}
				stmt = null;
			}
			if (conn != null) {
				try {conn.close();} catch (SQLException e) {
					e.printStackTrace();
				}
				conn = null;
			}
			
		}
	}
	
	public  boolean excute(String sql) {
		Connection conn = null;
		Statement stmt = null; // Or PreparedStatement if needed
		try {
				conn = getConnection();
				stmt = conn.createStatement();
				log.error("------------------------------------");
				log.error(sql);
				boolean execute = stmt.execute(sql);
				stmt.close();
				stmt = null;
				conn.close();
				conn = null; 
				return execute ;
			} catch (Exception e) {
				if (stmt != null) {
					try {stmt.close();} catch (SQLException e1) {
						e1.printStackTrace();
					}
					stmt = null;
				}
				if (conn != null) {
					try {conn.close();} catch (SQLException e2) {
						e2.printStackTrace();
					}
					conn = null;
				}
				e.printStackTrace();
				return false ;
				
			} finally {
			if (stmt != null) {
				try {stmt.close();}catch (SQLException e) {
					e.printStackTrace();
				}
				stmt = null;
			}
			if (conn != null) {
				try {conn.close();} catch (SQLException e) {
					e.printStackTrace();
				}
				conn = null;
			}
			
		}
     }
	public  int[] updateBatch(String[] sqlArr) {
		Connection conn = null;
		Statement stmt = null; // Or PreparedStatement if needed
		try {
			  if(sqlArr==null){
				  return null ;
			  }
			  else  {
				  
				  int len = sqlArr.length;
				  if(len==1){
					  boolean update = excute(sqlArr[0]);
					  return update?new int[1]:null;
				  }
			  }
				conn = getConnection();
				stmt = conn.createStatement();
				for(String sql : sqlArr){
					stmt.addBatch(sql);
				}
				int[] executeBatch = stmt.executeBatch();
				stmt.close();
				stmt = null;
				conn.close();
				conn = null; 
				return executeBatch ;
			} catch (Exception e) {
				if (stmt != null) {
					try {stmt.close();} catch (SQLException e1) {
						e1.printStackTrace();
					}
					stmt = null;
				}
				if (conn != null) {
					try {conn.close();} catch (SQLException e2) {
						e2.printStackTrace();
					}
					conn = null;
				}
				e.printStackTrace();
				return null ;
				
			} finally {
			if (stmt != null) {
				try {stmt.close();}catch (SQLException e) {
					e.printStackTrace();
				}
				stmt = null;
			}
			if (conn != null) {
				try {conn.close();} catch (SQLException e) {
					e.printStackTrace();
				}
				conn = null;
			}
			
		}
     }
	
	
}
