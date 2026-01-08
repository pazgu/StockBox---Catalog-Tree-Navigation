export interface AccordionData {
  id?: string;            
  uiId: string;          
  title: string;
  type: 'bullets' | 'content';
  content: string;
}
