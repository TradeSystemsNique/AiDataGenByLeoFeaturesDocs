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
  const string file = (PathGetDirectory(__PATH__) + "Doc\\features.json");
  HANDLE handle = kernel32::CreateFileW(file, GENERIC_WRITE, 0, 0, CREATE_ALWAYS, 0, 0);
  if(handle == INVALID_HANDLE)
   {
    LogCriticalError(StringFormat("Fallo al crear archivo = %s, ultimo err in kernel32 = %d", file, kernel32::GetLastError()), FUNCION_ACTUAL);
    return false;
   }

//---
  uchar data[];
  g_json_builder.GetBufferU8(data);

//---
  uint writen = 0;
  kernel32::WriteFile(handle, data, sizeof(uchar) * ArraySize(data), writen, NULL);
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
  string arr[];
  string temp[2];

//---
  for(int i = 0; i < tfea; i++)
   {
    g_json_builder.Obj();

    //---
    g_json_builder.Key("class_name").Val(creadores[i].ClassNameCreado());
    g_json_builder.Key("name").Val(keys[i]);
    g_json_builder.Key("desc").Val(creadores[i].Desc());
    g_json_builder.Key("type").Val(creadores[i].Type());
    g_json_builder.Key("example").Val(StringFormat("[%s][](%s)", keys[i], creadores[i].Params())); // tal cual
    g_json_builder.Key("params").Arr();

    //---
    const int t = StringSplit(creadores[i].Params(), '|', arr);
    if(t > 0)
     {
      for(int k = 0; k < t; k++)
       {
        //---
        g_json_builder.Obj();

        //---
        const int tv = StringSplit(arr[k], '=', temp);
        if(tv != 2)
         {
          LogError(StringFormat("Falllo al hacer split param, se requiere 2 key=val, val:\n%s", arr[i]), FUNCION_ACTUAL);
          return false;
         }
        g_json_builder.Key("name").Val(temp[0]);
        g_json_builder.Key("type").Val(temp[1]);

        //---
        g_json_builder.EndObj();
       }
     }

    //---
    g_json_builder.EndArr();
    g_json_builder.EndObj();
   }
  g_json_builder.EndArr().EndObj();

//---
  return WriteInFileJson();
 }
//+------------------------------------------------------------------+
/*
{
 "examples" : [
  {
   "file" : "ejemplo_vector.json",
   "desc" : "Ejmplo de como usar vector json\n e......."
   "id" : "vector"
  }
  .
  .

 ]
}
*/
