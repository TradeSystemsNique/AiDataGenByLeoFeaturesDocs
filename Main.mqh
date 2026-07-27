//+------------------------------------------------------------------+
//|                                                         Main.mqh |
//|                                  Copyright 2026, Niquel Mendoza. |
//|                          https://www.mql5.com/es/users/nique_372 |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Niquel Mendoza."
#property link      "https://www.mql5.com/es/users/nique_372"
#property strict

//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
#define AIDATAGENBYELO_FEATURES_ENABLE_DESC
#include "Global.mqh"
#include <TSN\\Json\\Json.mqh>
#include <TSN\\ExtraCodes\\MTTester.mqh>
#include <TSN\\MQLArticles\\Utils\\File.mqh>

//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
// Nota debe de conicidir con el feth que hace el js
#define FEATURESDOC_FILENAME_FEATURES_JSON ("features.json")


namespace TSN
{
//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
class CFeaturesDocsHtml : public CLoggerBase
 {
private:
  //---
  bool               WriteInFileJson();

public:
                     CFeaturesDocsHtml(void) {}
                    ~CFeaturesDocsHtml(void) {}

  //---
  void               Init();
  bool               Run();
 };



//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
bool CFeaturesDocsHtml::WriteInFileJson()
 {
//---
  const string file = (PathGetDirectory(__PATH__) + "docs\\features.json");
  HANDLE handle = kernel32::CreateFileW(file, GENERIC_WRITE, 0, 0, CREATE_ALWAYS, 0, 0);
  if(handle == INVALID_HANDLE)
   {
    LogCriticalError(StringFormat("Fallo al crear archivo:\n'%s'\nUltimo err in kernel32 = %d", file, kernel32::GetLastError()), FUNCION_ACTUAL);
    return false;
   }


//---
  uint writen = 0;
  kernel32::WriteFile(handle, g_json_builder.m_buf, sizeof(uchar) *   g_json_builder.m_pos, writen, NULL);
  kernel32::CloseHandle(handle);
  return true;
 }


//+------------------------------------------------------------------+
//|                                                                  |
//+------------------------------------------------------------------+
/*
{
  "features" : [
   {
    "class_name" : "CAiDataLeoFeatureRsi"
    "name" : "Rsi",
    "desc" : "Rsi ..."
    "type" : "indicador"
    "params" : [
      {
       name: "Period"
       type: "int"
      }
    ]
   }
  ]
}
*/
//---
bool CFeaturesDocsHtml::Run(void)
 {
//---
  g_json_builder.Clear();
  g_json_builder.Obj();
  g_json_builder.Key("features").Arr();

//---
  string keys[];
  CAiDataFeatureCreator* creadores[];
  const int tfea = CAiDataGenFeatureFactory::s_hash_str_to_creator.CopyTo(keys, creadores);

//---
  for(int i = 0; i < tfea; i++)
   {
    g_json_builder.Obj();

    //---
    g_json_builder.Key("class_name").ValSNoRef(creadores[i].ClassNameCreado());
    g_json_builder.Key("name").ValS(keys[i]);
    g_json_builder.Key("desc").ValSNoRef(creadores[i].Desc());
    g_json_builder.Key("type").ValSNoRef(creadores[i].Type());
    g_json_builder.Key("example").ValSNoRef(creadores[i].Params()); // tal cual


    //---
    g_json_builder.EndObj();
   }
  g_json_builder.EndArr().EndObj();

//---
  return WriteInFileJson();
 }
}
//+------------------------------------------------------------------+