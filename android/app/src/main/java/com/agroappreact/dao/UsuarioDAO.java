package com.example.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import com.example.agroapp.database.DatabaseHelper;
import com.example.agroapp.models.Usuario;
import com.example.agroapp.models.Usuario.TipoUsuario;

import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {
    private DatabaseHelper dbHelper;
    private static final int MAX_USUARIOS = 2; // Admin + 1 Usuario
    
    public UsuarioDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }
    
    public Usuario validarUsuario(String username, String password) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_USERNAME + "=? AND " + DatabaseHelper.COL_USUARIO_PASSWORD + "=?",
            new String[]{username, password},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public Usuario obtenerPorUsername(String username) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_USERNAME + "=?",
            new String[]{username},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public Usuario obtenerAdmin() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_ROL + "=?",
            new String[]{"ADMIN"},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public Usuario obtenerUsuarioNormal() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_ROL + "=?",
            new String[]{"USUARIO"},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public long insertarUsuario(Usuario usuario) {
        // Verificar que no se exceda el límite de usuarios (1 admin + 1 usuario)
        if (!puedeCrearUsuario()) {
            return -1; // No se puede crear más usuarios
        }
        
        // El usuario creado siempre será tipo USUARIO
        // El admin ya existe por defecto en el sistema
        usuario.setRol(TipoUsuario.USUARIO);
        
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_USUARIO_USERNAME, usuario.getUsername());
        values.put(DatabaseHelper.COL_USUARIO_PASSWORD, usuario.getPassword());
        values.put(DatabaseHelper.COL_USUARIO_NOMBRE, usuario.getNombre());
        values.put(DatabaseHelper.COL_USUARIO_ROL, usuario.getRol().name());
        
        return db.insert(DatabaseHelper.TABLE_USUARIOS, null, values);
    }
    
    public long insertar(Usuario usuario) {
        return insertarUsuario(usuario);
    }
    
    public int actualizarUsuario(Usuario usuario) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_USUARIO_USERNAME, usuario.getUsername());
        values.put(DatabaseHelper.COL_USUARIO_PASSWORD, usuario.getPassword());
        values.put(DatabaseHelper.COL_USUARIO_NOMBRE, usuario.getNombre());
        values.put(DatabaseHelper.COL_USUARIO_ROL, usuario.getRol().name());
        
        return db.update(
            DatabaseHelper.TABLE_USUARIOS,
            values,
            DatabaseHelper.COL_USUARIO_ID + "=?",
            new String[]{String.valueOf(usuario.getId())}
        );
    }
    
    public int eliminarUsuario(int id) {
        // No permitir eliminar al admin
        Usuario usuario = obtenerPorId(id);
        if (usuario != null && usuario.esAdmin()) {
            return 0; // No se puede eliminar al admin
        }
        
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        return db.delete(
            DatabaseHelper.TABLE_USUARIOS,
            DatabaseHelper.COL_USUARIO_ID + "=?",
            new String[]{String.valueOf(id)}
        );
    }
    
    public Usuario obtenerPorId(int id) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_ID + "=?",
            new String[]{String.valueOf(id)},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public boolean existeAdmin() {
        return obtenerAdmin() != null;
    }
    
    public boolean existeUsuarioNormal() {
        return obtenerUsuarioNormal() != null;
    }
    
    public boolean existeAlgunUsuario() {
        return contarUsuarios() > 0;
    }
    
    public int contarUsuarios() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT COUNT(*) FROM " + DatabaseHelper.TABLE_USUARIOS, null);
        
        int count = 0;
        if (cursor != null && cursor.moveToFirst()) {
            count = cursor.getInt(0);
            cursor.close();
        }
        
        return count;
    }
    
    public boolean puedeCrearUsuario() {
        return contarUsuarios() < MAX_USUARIOS;
    }
    
    public List<Usuario> obtenerTodosUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null, null, null, null, null,
            DatabaseHelper.COL_USUARIO_ROL + " ASC" // Admin primero
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                usuarios.add(cursorToUsuario(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        return usuarios;
    }
    
    private Usuario cursorToUsuario(Cursor cursor) {
        String rolStr = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_ROL));
        TipoUsuario rol = TipoUsuario.valueOf(rolStr);
        
        return new Usuario(
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_ID)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_USERNAME)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_PASSWORD)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_NOMBRE)),
            rol
        );
    }
}
